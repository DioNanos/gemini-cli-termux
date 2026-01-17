/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import { calculateTurnStats, calculateRewindImpact, revertFileChanges, } from './rewindFileOps.js';
import { coreEvents, } from '@google/gemini-cli-core';
// Mock fs/promises
vi.mock('node:fs/promises', () => ({
    default: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        rm: vi.fn(),
        unlink: vi.fn(),
    },
}));
// Mock @google/gemini-cli-core
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        debugLogger: {
            log: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        },
        getFileDiffFromResultDisplay: vi.fn(),
        computeAddedAndRemovedLines: vi.fn(),
    };
});
describe('rewindFileOps', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(coreEvents, 'emitFeedback');
    });
    describe('calculateTurnStats', () => {
        it('returns null if no edits found after user message', () => {
            const userMsg = { type: 'user' };
            const conversation = {
                messages: [
                    userMsg,
                    { type: 'gemini', text: 'Hello' },
                ],
            };
            const result = calculateTurnStats(conversation, userMsg);
            expect(result).toBeNull();
        });
        it('calculates stats for single turn correctly', async () => {
            const { getFileDiffFromResultDisplay, computeAddedAndRemovedLines } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay).mockReturnValue({
                filePath: 'test.ts',
                fileName: 'test.ts',
                originalContent: 'old',
                newContent: 'new',
                isNewFile: false,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff',
            });
            vi.mocked(computeAddedAndRemovedLines).mockReturnValue({
                addedLines: 3,
                removedLines: 3,
            });
            const userMsg = { type: 'user' };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [
                            {
                                name: 'replace',
                                args: {},
                                resultDisplay: 'diff',
                            },
                        ],
                    },
                ],
            };
            const result = calculateTurnStats(conversation, userMsg);
            expect(result).toEqual({
                fileCount: 1,
                addedLines: 3,
                removedLines: 3,
            });
        });
    });
    describe('calculateRewindImpact', () => {
        it('calculates cumulative stats across multiple turns', async () => {
            const { getFileDiffFromResultDisplay, computeAddedAndRemovedLines } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay)
                .mockReturnValueOnce({
                filePath: 'file1.ts',
                fileName: 'file1.ts',
                originalContent: '123',
                newContent: '12345',
                isNewFile: false,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff1',
            })
                .mockReturnValueOnce({
                filePath: 'file2.ts',
                fileName: 'file2.ts',
                originalContent: 'abc',
                newContent: 'abcd',
                isNewFile: true,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff2',
            });
            vi.mocked(computeAddedAndRemovedLines)
                .mockReturnValueOnce({ addedLines: 5, removedLines: 3 })
                .mockReturnValueOnce({ addedLines: 4, removedLines: 0 });
            const userMsg = { type: 'user' };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [
                            {
                                resultDisplay: 'd1',
                            },
                        ],
                    },
                    {
                        type: 'user',
                    },
                    {
                        type: 'gemini',
                        toolCalls: [
                            {
                                resultDisplay: 'd2',
                            },
                        ],
                    },
                ],
            };
            const result = calculateRewindImpact(conversation, userMsg);
            expect(result).toEqual({
                fileCount: 2,
                addedLines: 9, // 5 + 4
                removedLines: 3, // 3 + 0
                details: [
                    { fileName: 'file1.ts', diff: 'diff1' },
                    { fileName: 'file2.ts', diff: 'diff2' },
                ],
            });
        });
    });
    describe('revertFileChanges', () => {
        it('does nothing if message not found', async () => {
            await revertFileChanges({ messages: [] }, 'missing');
            expect(fs.writeFile).not.toHaveBeenCalled();
        });
        it('reverts exact match', async () => {
            const { getFileDiffFromResultDisplay } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay).mockReturnValue({
                filePath: '/abs/path/test.ts',
                fileName: 'test.ts',
                originalContent: 'ORIGINAL_CONTENT',
                newContent: 'NEW_CONTENT',
                isNewFile: false,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff',
            });
            const userMsg = {
                type: 'user',
                id: 'target',
            };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [{ resultDisplay: 'diff' }],
                    },
                ],
            };
            vi.mocked(fs.readFile).mockResolvedValue('NEW_CONTENT');
            await revertFileChanges(conversation, 'target');
            expect(fs.writeFile).toHaveBeenCalledWith('/abs/path/test.ts', 'ORIGINAL_CONTENT');
        });
        it('deletes new file on revert', async () => {
            const { getFileDiffFromResultDisplay } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay).mockReturnValue({
                filePath: '/abs/path/new.ts',
                fileName: 'new.ts',
                originalContent: '',
                newContent: 'SOME_CONTENT',
                isNewFile: true,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff',
            });
            const userMsg = {
                type: 'user',
                id: 'target',
            };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [{ resultDisplay: 'diff' }],
                    },
                ],
            };
            vi.mocked(fs.readFile).mockResolvedValue('SOME_CONTENT');
            await revertFileChanges(conversation, 'target');
            expect(fs.unlink).toHaveBeenCalledWith('/abs/path/new.ts');
        });
        it('handles smart revert (patching) successfully', async () => {
            const { getFileDiffFromResultDisplay } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay).mockReturnValue({
                filePath: '/abs/path/test.ts',
                fileName: 'test.ts',
                originalContent: 'LINE1\nLINE2\nLINE3',
                newContent: 'LINE1\nEDITED\nLINE3',
                isNewFile: false,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff',
            });
            const userMsg = {
                type: 'user',
                id: 'target',
            };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [{ resultDisplay: 'diff' }],
                    },
                ],
            };
            // Current content has FURTHER changes
            vi.mocked(fs.readFile).mockResolvedValue('LINE1\nEDITED\nLINE3\nNEWLINE');
            await revertFileChanges(conversation, 'target');
            // Should have successfully patched it back to ORIGINAL state but kept the NEWLINE
            expect(fs.writeFile).toHaveBeenCalledWith('/abs/path/test.ts', 'LINE1\nLINE2\nLINE3\nNEWLINE');
        });
        it('emits warning on smart revert failure', async () => {
            const { getFileDiffFromResultDisplay } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay).mockReturnValue({
                filePath: '/abs/path/test.ts',
                fileName: 'test.ts',
                originalContent: 'OLD',
                newContent: 'NEW',
                isNewFile: false,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff',
            });
            const userMsg = {
                type: 'user',
                id: 'target',
            };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [{ resultDisplay: 'diff' }],
                    },
                ],
            };
            // Current content is completely unrelated - diff won't apply
            vi.mocked(fs.readFile).mockResolvedValue('UNRELATED');
            await revertFileChanges(conversation, 'target');
            expect(fs.writeFile).not.toHaveBeenCalled();
            expect(coreEvents.emitFeedback).toHaveBeenCalledWith('warning', expect.stringContaining('Smart revert for test.ts failed'));
        });
        it('emits error if fs.readFile fails with a generic error', async () => {
            const { getFileDiffFromResultDisplay } = await import('@google/gemini-cli-core');
            vi.mocked(getFileDiffFromResultDisplay).mockReturnValue({
                filePath: '/abs/path/test.ts',
                fileName: 'test.ts',
                originalContent: 'OLD',
                newContent: 'NEW',
                isNewFile: false,
                diffStat: {
                    model_added_lines: 0,
                    model_removed_lines: 0,
                    model_added_chars: 0,
                    model_removed_chars: 0,
                    user_added_lines: 0,
                    user_removed_lines: 0,
                    user_added_chars: 0,
                    user_removed_chars: 0,
                },
                fileDiff: 'diff',
            });
            const userMsg = {
                type: 'user',
                id: 'target',
            };
            const conversation = {
                messages: [
                    userMsg,
                    {
                        type: 'gemini',
                        toolCalls: [{ resultDisplay: 'diff' }],
                    },
                ],
            };
            vi.mocked(fs.readFile).mockRejectedValue(new Error('disk failure'));
            await revertFileChanges(conversation, 'target');
            expect(coreEvents.emitFeedback).toHaveBeenCalledWith('error', expect.stringContaining('Error reading test.ts during revert: disk failure'), expect.any(Error));
        });
    });
});
//# sourceMappingURL=rewindFileOps.test.js.map