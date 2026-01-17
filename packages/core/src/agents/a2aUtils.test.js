/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect } from 'vitest';
import { extractMessageText, extractTaskText, extractIdsFromResponse, } from './a2aUtils.js';
describe('a2aUtils', () => {
    describe('extractIdsFromResponse', () => {
        it('should extract IDs from a message response', () => {
            const message = {
                kind: 'message',
                role: 'agent',
                messageId: 'm1',
                contextId: 'ctx-1',
                taskId: 'task-1',
                parts: [],
            };
            const result = extractIdsFromResponse(message);
            expect(result).toEqual({ contextId: 'ctx-1', taskId: 'task-1' });
        });
        it('should extract IDs from an in-progress task response', () => {
            const task = {
                id: 'task-2',
                contextId: 'ctx-2',
                kind: 'task',
                status: { state: 'working' },
            };
            const result = extractIdsFromResponse(task);
            expect(result).toEqual({ contextId: 'ctx-2', taskId: 'task-2' });
        });
    });
    describe('extractMessageText', () => {
        it('should extract text from simple text parts', () => {
            const message = {
                kind: 'message',
                role: 'user',
                messageId: '1',
                parts: [
                    { kind: 'text', text: 'Hello' },
                    { kind: 'text', text: 'World' },
                ],
            };
            expect(extractMessageText(message)).toBe('Hello\nWorld');
        });
        it('should extract data from data parts', () => {
            const message = {
                kind: 'message',
                role: 'user',
                messageId: '1',
                parts: [{ kind: 'data', data: { foo: 'bar' } }],
            };
            expect(extractMessageText(message)).toBe('Data: {"foo":"bar"}');
        });
        it('should extract file info from file parts', () => {
            const message = {
                kind: 'message',
                role: 'user',
                messageId: '1',
                parts: [
                    {
                        kind: 'file',
                        file: {
                            name: 'test.txt',
                            uri: 'file://test.txt',
                            mimeType: 'text/plain',
                        },
                    },
                    {
                        kind: 'file',
                        file: {
                            uri: 'http://example.com/doc',
                            mimeType: 'application/pdf',
                        },
                    },
                ],
            };
            // The formatting logic in a2aUtils prefers name over uri
            expect(extractMessageText(message)).toContain('File: test.txt');
            expect(extractMessageText(message)).toContain('File: http://example.com/doc');
        });
        it('should handle mixed parts', () => {
            const message = {
                kind: 'message',
                role: 'user',
                messageId: '1',
                parts: [
                    { kind: 'text', text: 'Here is data:' },
                    { kind: 'data', data: { value: 123 } },
                ],
            };
            expect(extractMessageText(message)).toBe('Here is data:\nData: {"value":123}');
        });
        it('should return empty string for undefined or empty message', () => {
            expect(extractMessageText(undefined)).toBe('');
            expect(extractMessageText({
                kind: 'message',
                role: 'user',
                messageId: '1',
                parts: [],
            })).toBe('');
        });
    });
    describe('extractTaskText', () => {
        it('should extract basic task info (clean)', () => {
            const task = {
                id: 'task-1',
                contextId: 'ctx-1',
                kind: 'task',
                status: {
                    state: 'working',
                    message: {
                        kind: 'message',
                        role: 'agent',
                        messageId: 'm1',
                        parts: [{ kind: 'text', text: 'Processing...' }],
                    },
                },
            };
            const result = extractTaskText(task);
            expect(result).not.toContain('ID: task-1');
            expect(result).not.toContain('State: working');
            expect(result).toBe('Processing...');
        });
        it('should extract artifacts with headers', () => {
            const task = {
                id: 'task-1',
                contextId: 'ctx-1',
                kind: 'task',
                status: { state: 'completed' },
                artifacts: [
                    {
                        artifactId: 'art-1',
                        name: 'Report',
                        parts: [{ kind: 'text', text: 'This is the report.' }],
                    },
                ],
            };
            const result = extractTaskText(task);
            expect(result).toContain('Artifact (Report):');
            expect(result).toContain('This is the report.');
            expect(result).not.toContain('Artifacts:');
            expect(result).not.toContain('  - Name: Report');
        });
    });
});
//# sourceMappingURL=a2aUtils.test.js.map