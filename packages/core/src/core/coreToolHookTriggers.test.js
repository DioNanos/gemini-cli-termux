/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeToolWithHooks } from './coreToolHookTriggers.js';
import { ToolErrorType } from '../tools/tool-error.js';
import { BaseToolInvocation, } from '../tools/tools.js';
import { MessageBusType, } from '../confirmation-bus/types.js';
class MockInvocation extends BaseToolInvocation {
    constructor(params, messageBus) {
        super(params, messageBus);
    }
    getDescription() {
        return 'mock';
    }
    async execute() {
        return {
            llmContent: this.params.key ? `key: ${this.params.key}` : 'success',
            returnDisplay: this.params.key
                ? `key: ${this.params.key}`
                : 'success display',
        };
    }
}
describe('executeToolWithHooks', () => {
    let messageBus;
    let mockTool;
    beforeEach(() => {
        messageBus = {
            request: vi.fn(),
            publish: vi.fn(),
            subscribe: vi.fn(),
            unsubscribe: vi.fn(),
        };
        mockTool = {
            build: vi
                .fn()
                .mockImplementation((params) => new MockInvocation(params, messageBus)),
        };
    });
    it('should prioritize continue: false over decision: block in BeforeTool', async () => {
        const invocation = new MockInvocation({}, messageBus);
        const abortSignal = new AbortController().signal;
        vi.mocked(messageBus.request).mockResolvedValue({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: {
                continue: false,
                stopReason: 'Stop immediately',
                decision: 'block',
                reason: 'Should be ignored because continue is false',
            },
        });
        const result = await executeToolWithHooks(invocation, 'test_tool', abortSignal, messageBus, true, mockTool);
        expect(result.error?.type).toBe(ToolErrorType.STOP_EXECUTION);
        expect(result.error?.message).toBe('Stop immediately');
    });
    it('should block execution in BeforeTool if decision is block', async () => {
        const invocation = new MockInvocation({}, messageBus);
        const abortSignal = new AbortController().signal;
        vi.mocked(messageBus.request).mockResolvedValue({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: {
                decision: 'block',
                reason: 'Execution blocked',
            },
        });
        const result = await executeToolWithHooks(invocation, 'test_tool', abortSignal, messageBus, true, mockTool);
        expect(result.error?.type).toBe(ToolErrorType.EXECUTION_FAILED);
        expect(result.error?.message).toBe('Execution blocked');
    });
    it('should handle continue: false in AfterTool', async () => {
        const invocation = new MockInvocation({}, messageBus);
        const abortSignal = new AbortController().signal;
        const spy = vi.spyOn(invocation, 'execute');
        // BeforeTool allow
        vi.mocked(messageBus.request)
            .mockResolvedValueOnce({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: { decision: 'allow' },
        })
            // AfterTool stop
            .mockResolvedValueOnce({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: {
                continue: false,
                stopReason: 'Stop after execution',
            },
        });
        const result = await executeToolWithHooks(invocation, 'test_tool', abortSignal, messageBus, true, mockTool);
        expect(result.error?.type).toBe(ToolErrorType.STOP_EXECUTION);
        expect(result.error?.message).toBe('Stop after execution');
        expect(spy).toHaveBeenCalled();
    });
    it('should block result in AfterTool if decision is deny', async () => {
        const invocation = new MockInvocation({}, messageBus);
        const abortSignal = new AbortController().signal;
        // BeforeTool allow
        vi.mocked(messageBus.request)
            .mockResolvedValueOnce({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: { decision: 'allow' },
        })
            // AfterTool deny
            .mockResolvedValueOnce({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: {
                decision: 'deny',
                reason: 'Result denied',
            },
        });
        const result = await executeToolWithHooks(invocation, 'test_tool', abortSignal, messageBus, true, mockTool);
        expect(result.error?.type).toBe(ToolErrorType.EXECUTION_FAILED);
        expect(result.error?.message).toBe('Result denied');
    });
    it('should apply modified tool input from BeforeTool hook', async () => {
        const params = { key: 'original' };
        const invocation = new MockInvocation(params, messageBus);
        const toolName = 'test-tool';
        const abortSignal = new AbortController().signal;
        // Capture arguments to verify what was passed before modification
        const requestSpy = vi.fn().mockImplementation(async (request) => {
            if (request.eventName === 'BeforeTool') {
                // Verify input is original before we return modification instruction
                expect(request.input.tool_input.key).toBe('original');
                return {
                    type: MessageBusType.HOOK_EXECUTION_RESPONSE,
                    correlationId: 'test-id',
                    success: true,
                    output: {
                        hookSpecificOutput: {
                            hookEventName: 'BeforeTool',
                            tool_input: { key: 'modified' },
                        },
                    },
                };
            }
            return {
                type: MessageBusType.HOOK_EXECUTION_RESPONSE,
                correlationId: 'test-id',
                success: true,
                output: {},
            };
        });
        messageBus.request = requestSpy;
        const result = await executeToolWithHooks(invocation, toolName, abortSignal, messageBus, true, // hooksEnabled
        mockTool);
        // Verify result reflects modified input
        expect(result.llmContent).toBe('key: modified\n\n[System] Tool input parameters (key) were modified by a hook before execution.');
        // Verify params object was modified in place
        expect(invocation.params.key).toBe('modified');
        expect(requestSpy).toHaveBeenCalled();
        expect(mockTool.build).toHaveBeenCalledWith({ key: 'modified' });
    });
    it('should not modify input if hook does not provide tool_input', async () => {
        const params = { key: 'original' };
        const invocation = new MockInvocation(params, messageBus);
        const toolName = 'test-tool';
        const abortSignal = new AbortController().signal;
        vi.mocked(messageBus.request).mockResolvedValue({
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId: 'test-id',
            success: true,
            output: {
                hookSpecificOutput: {
                    hookEventName: 'BeforeTool',
                    // No tool_input
                },
            },
        });
        const result = await executeToolWithHooks(invocation, toolName, abortSignal, messageBus, true, // hooksEnabled
        mockTool);
        expect(result.llmContent).toBe('key: original');
        expect(invocation.params.key).toBe('original');
        expect(mockTool.build).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=coreToolHookTriggers.test.js.map