/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { renderHook } from '../../test-utils/render.js';
import { useReactToolScheduler, mapToDisplay, } from './useReactToolScheduler.js';
import { DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES, DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD, ToolConfirmationOutcome, ApprovalMode, HookSystem, PREVIEW_GEMINI_MODEL, PolicyDecision, } from '@google/gemini-cli-core';
import { MockTool } from '@google/gemini-cli-core/src/test-utils/mock-tool.js';
import { createMockMessageBus } from '@google/gemini-cli-core/src/test-utils/mock-message-bus.js';
import { ToolCallStatus } from '../types.js';
// Mocks
vi.mock('@google/gemini-cli-core', async () => {
    const actual = await vi.importActual('@google/gemini-cli-core');
    // Patch CoreToolScheduler to have cancelAll if it's missing in the test environment
    if (actual.CoreToolScheduler &&
        !actual.CoreToolScheduler.prototype.cancelAll) {
        actual.CoreToolScheduler.prototype.cancelAll = vi.fn();
    }
    return {
        ...actual,
        ToolRegistry: vi.fn(),
        Config: vi.fn(),
    };
});
const mockToolRegistry = {
    getTool: vi.fn(),
    getAllToolNames: vi.fn(() => ['mockTool', 'anotherTool']),
};
const mockConfig = {
    getToolRegistry: vi.fn(() => mockToolRegistry),
    getApprovalMode: vi.fn(() => ApprovalMode.DEFAULT),
    getSessionId: () => 'test-session-id',
    getUsageStatisticsEnabled: () => true,
    getDebugMode: () => false,
    storage: {
        getProjectTempDir: () => '/tmp',
    },
    getTruncateToolOutputThreshold: () => DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD,
    getTruncateToolOutputLines: () => DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES,
    getAllowedTools: vi.fn(() => []),
    getActiveModel: () => PREVIEW_GEMINI_MODEL,
    getContentGeneratorConfig: () => ({
        model: 'test-model',
        authType: 'oauth-personal',
    }),
    getGeminiClient: () => null, // No client needed for these tests
    getShellExecutionConfig: () => ({ terminalWidth: 80, terminalHeight: 24 }),
    getMessageBus: () => null,
    isInteractive: () => false,
    getExperiments: () => { },
    getEnableHooks: () => false,
};
mockConfig.getMessageBus = vi.fn().mockReturnValue(createMockMessageBus());
mockConfig.getHookSystem = vi.fn().mockReturnValue(new HookSystem(mockConfig));
mockConfig.getPolicyEngine = vi.fn().mockReturnValue({
    check: async () => {
        const mode = mockConfig.getApprovalMode();
        if (mode === ApprovalMode.YOLO) {
            return { decision: PolicyDecision.ALLOW };
        }
        return { decision: PolicyDecision.ASK_USER };
    },
});
function createMockConfigOverride(overrides = {}) {
    return { ...mockConfig, ...overrides };
}
const mockTool = new MockTool({
    name: 'mockTool',
    displayName: 'Mock Tool',
    execute: vi.fn(),
    shouldConfirmExecute: vi.fn(),
});
const mockToolWithLiveOutput = new MockTool({
    name: 'mockToolWithLiveOutput',
    displayName: 'Mock Tool With Live Output',
    description: 'A mock tool for testing',
    params: {},
    isOutputMarkdown: true,
    canUpdateOutput: true,
    execute: vi.fn(),
    shouldConfirmExecute: vi.fn(),
});
let mockOnUserConfirmForToolConfirmation;
const mockToolRequiresConfirmation = new MockTool({
    name: 'mockToolRequiresConfirmation',
    displayName: 'Mock Tool Requires Confirmation',
    execute: vi.fn(),
    shouldConfirmExecute: vi.fn(),
});
describe('useReactToolScheduler in YOLO Mode', () => {
    let onComplete;
    beforeEach(() => {
        onComplete = vi.fn();
        mockToolRegistry.getTool.mockClear();
        mockToolRequiresConfirmation.execute.mockClear();
        mockToolRequiresConfirmation.shouldConfirmExecute.mockClear();
        // IMPORTANT: Enable YOLO mode for this test suite
        mockConfig.getApprovalMode.mockReturnValue(ApprovalMode.YOLO);
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        // IMPORTANT: Disable YOLO mode after this test suite
        mockConfig.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
    });
    const renderSchedulerInYoloMode = () => renderHook(() => useReactToolScheduler(onComplete, mockConfig, () => undefined));
    it('should skip confirmation and execute tool directly when yoloMode is true', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockToolRequiresConfirmation);
        const expectedOutput = 'YOLO Confirmed output';
        mockToolRequiresConfirmation.execute.mockResolvedValue({
            llmContent: expectedOutput,
            returnDisplay: 'YOLO Formatted tool output',
        });
        const { result } = renderSchedulerInYoloMode();
        const schedule = result.current[1];
        const request = {
            callId: 'yoloCall',
            name: 'mockToolRequiresConfirmation',
            args: { data: 'any data' },
        };
        await act(async () => {
            await schedule(request, new AbortController().signal);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0); // Process validation
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0); // Process scheduling
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0); // Process execution
        });
        // Check that execute WAS called
        expect(mockToolRequiresConfirmation.execute).toHaveBeenCalledWith(request.args);
        // Check that onComplete was called with success
        expect(onComplete).toHaveBeenCalledWith([
            expect.objectContaining({
                status: 'success',
                request,
                response: expect.objectContaining({
                    resultDisplay: 'YOLO Formatted tool output',
                    responseParts: [
                        {
                            functionResponse: {
                                id: 'yoloCall',
                                name: 'mockToolRequiresConfirmation',
                                response: { output: expectedOutput },
                            },
                        },
                    ],
                }),
            }),
        ]);
    });
});
describe('useReactToolScheduler', () => {
    let onComplete;
    let capturedOnConfirmForTest;
    const advanceAndSettle = async () => {
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
    };
    const scheduleAndWaitForExecution = async (schedule, request) => {
        await act(async () => {
            await schedule(request, new AbortController().signal);
        });
        await advanceAndSettle();
        await advanceAndSettle();
        await advanceAndSettle();
    };
    beforeEach(() => {
        onComplete = vi.fn();
        capturedOnConfirmForTest = undefined;
        mockToolRegistry.getTool.mockClear();
        mockTool.execute.mockClear();
        mockTool.shouldConfirmExecute.mockClear();
        mockToolWithLiveOutput.execute.mockClear();
        mockToolWithLiveOutput.shouldConfirmExecute.mockClear();
        mockToolRequiresConfirmation.execute.mockClear();
        mockToolRequiresConfirmation.shouldConfirmExecute.mockClear();
        mockOnUserConfirmForToolConfirmation = vi.fn();
        mockToolRequiresConfirmation.shouldConfirmExecute.mockImplementation(async () => ({
            onConfirm: mockOnUserConfirmForToolConfirmation,
            fileName: 'mockToolRequiresConfirmation.ts',
            fileDiff: 'Mock tool requires confirmation',
            type: 'edit',
            title: 'Mock Tool Requires Confirmation',
        }));
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });
    const renderScheduler = (config = mockConfig) => renderHook(() => useReactToolScheduler(onComplete, config, () => undefined));
    it('initial state should be empty', () => {
        const { result } = renderScheduler();
        expect(result.current[0]).toEqual([]);
    });
    it('should schedule and execute a tool call successfully', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockTool);
        mockTool.execute.mockResolvedValue({
            llmContent: 'Tool output',
            returnDisplay: 'Formatted tool output',
        });
        mockTool.shouldConfirmExecute.mockResolvedValue(null);
        const { result } = renderScheduler();
        const request = {
            callId: 'call1',
            name: 'mockTool',
            args: { param: 'value' },
        };
        let completedToolCalls = [];
        onComplete.mockImplementation((calls) => {
            completedToolCalls = calls;
        });
        await scheduleAndWaitForExecution(result.current[1], request);
        expect(mockTool.execute).toHaveBeenCalledWith(request.args);
        expect(completedToolCalls).toHaveLength(1);
        expect(completedToolCalls[0].status).toBe('success');
        expect(completedToolCalls[0].request).toBe(request);
        if (completedToolCalls[0].status === 'success' ||
            completedToolCalls[0].status === 'error') {
            expect(completedToolCalls[0].response).toMatchSnapshot();
        }
    });
    it('should clear previous tool calls when scheduling new ones', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockTool);
        mockTool.execute.mockImplementation(async () => {
            await new Promise((r) => setTimeout(r, 10));
            return {
                llmContent: 'Tool output',
                returnDisplay: 'Formatted tool output',
            };
        });
        const { result } = renderScheduler();
        const schedule = result.current[1];
        const setToolCallsForDisplay = result.current[3];
        // Manually set a tool call in the display.
        const oldToolCall = {
            request: { callId: 'oldCall' },
            status: 'success',
        };
        act(() => {
            setToolCallsForDisplay([oldToolCall]);
        });
        expect(result.current[0]).toEqual([oldToolCall]);
        const newRequest = {
            callId: 'newCall',
            name: 'mockTool',
            args: {},
        };
        let schedulePromise;
        await act(async () => {
            schedulePromise = schedule(newRequest, new AbortController().signal);
        });
        await advanceAndSettle();
        // After scheduling, the old call should be gone,
        // and the new one should be in the display in its initial state.
        expect(result.current[0].length).toBe(1);
        expect(result.current[0][0].request.callId).toBe('newCall');
        expect(result.current[0][0].request.callId).not.toBe('oldCall');
        // Let the new call finish.
        await act(async () => {
            await vi.advanceTimersByTimeAsync(20);
        });
        await act(async () => {
            await schedulePromise;
        });
        expect(onComplete).toHaveBeenCalled();
    });
    it('should cancel all running tool calls', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockTool);
        let resolveExecute = () => { };
        const executePromise = new Promise((resolve) => {
            resolveExecute = resolve;
        });
        mockTool.execute.mockReturnValue(executePromise);
        mockTool.shouldConfirmExecute.mockResolvedValue(null);
        const { result } = renderScheduler();
        const schedule = result.current[1];
        const cancelAllToolCalls = result.current[4];
        const request = {
            callId: 'cancelCall',
            name: 'mockTool',
            args: {},
        };
        let schedulePromise;
        await act(async () => {
            schedulePromise = schedule(request, new AbortController().signal);
        });
        await advanceAndSettle(); // validation
        await advanceAndSettle(); // Process scheduling
        // At this point, the tool is 'executing' and waiting on the promise.
        expect(result.current[0][0].status).toBe('executing');
        const cancelController = new AbortController();
        act(() => {
            cancelAllToolCalls(cancelController.signal);
        });
        await advanceAndSettle();
        expect(onComplete).toHaveBeenCalledWith([
            expect.objectContaining({
                status: 'cancelled',
                request,
            }),
        ]);
        // Clean up the pending promise to avoid open handles.
        await act(async () => {
            resolveExecute({ llmContent: 'output', returnDisplay: 'display' });
        });
        // Now await the schedule promise
        await act(async () => {
            await schedulePromise;
        });
    });
    it.each([
        {
            desc: 'tool not found',
            setup: () => {
                mockToolRegistry.getTool.mockReturnValue(undefined);
            },
            request: {
                callId: 'call1',
                name: 'nonexistentTool',
                args: {},
            },
            expectedErrorContains: [
                'Tool "nonexistentTool" not found in registry',
                'Did you mean one of:',
            ],
        },
        {
            desc: 'error during shouldConfirmExecute',
            setup: () => {
                mockToolRegistry.getTool.mockReturnValue(mockTool);
                const confirmError = new Error('Confirmation check failed');
                mockTool.shouldConfirmExecute.mockRejectedValue(confirmError);
            },
            request: {
                callId: 'call1',
                name: 'mockTool',
                args: {},
            },
            expectedError: new Error('Confirmation check failed'),
        },
        {
            desc: 'error during execute',
            setup: () => {
                mockToolRegistry.getTool.mockReturnValue(mockTool);
                mockTool.shouldConfirmExecute.mockResolvedValue(null);
                const execError = new Error('Execution failed');
                mockTool.execute.mockRejectedValue(execError);
            },
            request: {
                callId: 'call1',
                name: 'mockTool',
                args: {},
            },
            expectedError: new Error('Execution failed'),
        },
    ])('should handle $desc', async ({ setup, request, expectedErrorContains, expectedError }) => {
        setup();
        const { result } = renderScheduler();
        let completedToolCalls = [];
        onComplete.mockImplementation((calls) => {
            completedToolCalls = calls;
        });
        await scheduleAndWaitForExecution(result.current[1], request);
        expect(completedToolCalls).toHaveLength(1);
        expect(completedToolCalls[0].status).toBe('error');
        expect(completedToolCalls[0].request).toBe(request);
        if (expectedErrorContains) {
            expectedErrorContains.forEach((errorText) => {
                expect(completedToolCalls[0].response.error.message).toContain(errorText);
            });
        }
        if (expectedError) {
            expect(completedToolCalls[0].response.error.message).toBe(expectedError.message);
        }
    });
    it('should handle tool requiring confirmation - approved', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockToolRequiresConfirmation);
        const config = createMockConfigOverride({
            isInteractive: () => true,
        });
        const expectedOutput = 'Confirmed output';
        mockToolRequiresConfirmation.execute.mockResolvedValue({
            llmContent: expectedOutput,
            returnDisplay: 'Confirmed display',
        });
        const { result } = renderScheduler(config);
        const schedule = result.current[1];
        const request = {
            callId: 'callConfirm',
            name: 'mockToolRequiresConfirmation',
            args: { data: 'sensitive' },
        };
        let schedulePromise;
        await act(async () => {
            schedulePromise = schedule(request, new AbortController().signal);
        });
        await advanceAndSettle();
        const waitingCall = result.current[0][0];
        expect(waitingCall.status).toBe('awaiting_approval');
        capturedOnConfirmForTest = waitingCall.confirmationDetails?.onConfirm;
        expect(capturedOnConfirmForTest).toBeDefined();
        await act(async () => {
            await capturedOnConfirmForTest?.(ToolConfirmationOutcome.ProceedOnce);
        });
        await advanceAndSettle();
        // Now await the schedule promise as it should complete
        await act(async () => {
            await schedulePromise;
        });
        expect(mockOnUserConfirmForToolConfirmation).toHaveBeenCalledWith(ToolConfirmationOutcome.ProceedOnce);
        expect(mockToolRequiresConfirmation.execute).toHaveBeenCalled();
        const completedCalls = onComplete.mock.calls[0][0];
        expect(completedCalls[0].status).toBe('success');
        expect(completedCalls[0].request).toBe(request);
        if (completedCalls[0].status === 'success' ||
            completedCalls[0].status === 'error') {
            expect(completedCalls[0].response).toMatchSnapshot();
        }
    });
    it('should handle tool requiring confirmation - cancelled by user', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockToolRequiresConfirmation);
        const config = createMockConfigOverride({
            isInteractive: () => true,
        });
        const { result } = renderScheduler(config);
        const schedule = result.current[1];
        const request = {
            callId: 'callConfirmCancel',
            name: 'mockToolRequiresConfirmation',
            args: {},
        };
        let schedulePromise;
        await act(async () => {
            schedulePromise = schedule(request, new AbortController().signal);
        });
        await advanceAndSettle();
        const waitingCall = result.current[0][0];
        expect(waitingCall.status).toBe('awaiting_approval');
        capturedOnConfirmForTest = waitingCall.confirmationDetails?.onConfirm;
        expect(capturedOnConfirmForTest).toBeDefined();
        await act(async () => {
            await capturedOnConfirmForTest?.(ToolConfirmationOutcome.Cancel);
        });
        await advanceAndSettle();
        // Now await the schedule promise
        await act(async () => {
            await schedulePromise;
        });
        expect(mockOnUserConfirmForToolConfirmation).toHaveBeenCalledWith(ToolConfirmationOutcome.Cancel);
        const completedCalls = onComplete.mock.calls[0][0];
        expect(completedCalls[0].status).toBe('cancelled');
        expect(completedCalls[0].request).toBe(request);
        if (completedCalls[0].status === 'success' ||
            completedCalls[0].status === 'error' ||
            completedCalls[0].status === 'cancelled') {
            expect(completedCalls[0].response).toMatchSnapshot();
        }
    });
    it('should handle live output updates', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockToolWithLiveOutput);
        let liveUpdateFn;
        let resolveExecutePromise;
        const executePromise = new Promise((resolve) => {
            resolveExecutePromise = resolve;
        });
        mockToolWithLiveOutput.execute.mockImplementation(async (_args, _signal, updateFn) => {
            liveUpdateFn = updateFn;
            return executePromise;
        });
        mockToolWithLiveOutput.shouldConfirmExecute.mockResolvedValue(null);
        const { result } = renderScheduler();
        const request = {
            callId: 'liveCall',
            name: 'mockToolWithLiveOutput',
            args: {},
        };
        let schedulePromise;
        await act(async () => {
            schedulePromise = result.current[1](request, new AbortController().signal);
        });
        await advanceAndSettle();
        expect(liveUpdateFn).toBeDefined();
        expect(result.current[0][0].status).toBe('executing');
        await act(async () => {
            liveUpdateFn?.('Live output 1');
        });
        await advanceAndSettle();
        await act(async () => {
            liveUpdateFn?.('Live output 2');
        });
        await advanceAndSettle();
        act(() => {
            resolveExecutePromise({
                llmContent: 'Final output',
                returnDisplay: 'Final display',
            });
        });
        await advanceAndSettle();
        // Now await schedule
        await act(async () => {
            await schedulePromise;
        });
        const completedCalls = onComplete.mock.calls[0][0];
        expect(completedCalls[0].status).toBe('success');
        expect(completedCalls[0].request).toBe(request);
        if (completedCalls[0].status === 'success' ||
            completedCalls[0].status === 'error') {
            expect(completedCalls[0].response).toMatchSnapshot();
        }
        expect(result.current[0]).toEqual([]);
    });
    it('should schedule and execute multiple tool calls', async () => {
        const tool1 = new MockTool({
            name: 'tool1',
            displayName: 'Tool 1',
            execute: vi.fn().mockResolvedValue({
                llmContent: 'Output 1',
                returnDisplay: 'Display 1',
            }),
        });
        const tool2 = new MockTool({
            name: 'tool2',
            displayName: 'Tool 2',
            execute: vi.fn().mockResolvedValue({
                llmContent: 'Output 2',
                returnDisplay: 'Display 2',
            }),
        });
        mockToolRegistry.getTool.mockImplementation((name) => {
            if (name === 'tool1')
                return tool1;
            if (name === 'tool2')
                return tool2;
            return undefined;
        });
        const { result } = renderScheduler();
        const schedule = result.current[1];
        const requests = [
            { callId: 'multi1', name: 'tool1', args: { p: 1 } },
            { callId: 'multi2', name: 'tool2', args: { p: 2 } },
        ];
        await act(async () => {
            await schedule(requests, new AbortController().signal);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(onComplete).toHaveBeenCalledTimes(1);
        const completedCalls = onComplete.mock.calls[0][0];
        expect(completedCalls.length).toBe(2);
        const call1Result = completedCalls.find((c) => c.request.callId === 'multi1');
        const call2Result = completedCalls.find((c) => c.request.callId === 'multi2');
        expect(call1Result).toMatchObject({
            status: 'success',
            request: requests[0],
            response: expect.objectContaining({
                resultDisplay: 'Display 1',
                responseParts: [
                    {
                        functionResponse: {
                            id: 'multi1',
                            name: 'tool1',
                            response: { output: 'Output 1' },
                        },
                    },
                ],
            }),
        });
        expect(call2Result).toMatchObject({
            status: 'success',
            request: requests[1],
            response: expect.objectContaining({
                resultDisplay: 'Display 2',
                responseParts: [
                    {
                        functionResponse: {
                            id: 'multi2',
                            name: 'tool2',
                            response: { output: 'Output 2' },
                        },
                    },
                ],
            }),
        });
        expect(completedCalls).toHaveLength(2);
        expect(completedCalls.every((t) => t.status === 'success')).toBe(true);
    });
    it('should queue if scheduling while already running', async () => {
        mockToolRegistry.getTool.mockReturnValue(mockTool);
        const longExecutePromise = new Promise((resolve) => setTimeout(() => resolve({
            llmContent: 'done',
            returnDisplay: 'done display',
        }), 50));
        mockTool.execute.mockReturnValue(longExecutePromise);
        mockTool.shouldConfirmExecute.mockResolvedValue(null);
        const { result } = renderScheduler();
        const schedule = result.current[1];
        const request1 = {
            callId: 'run1',
            name: 'mockTool',
            args: {},
        };
        const request2 = {
            callId: 'run2',
            name: 'mockTool',
            args: {},
        };
        let schedulePromise1;
        let schedulePromise2;
        await act(async () => {
            schedulePromise1 = schedule(request1, new AbortController().signal);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
            schedulePromise2 = schedule(request2, new AbortController().signal);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
            await vi.advanceTimersByTimeAsync(0);
        });
        // Wait for first to complete
        await act(async () => {
            await schedulePromise1;
        });
        expect(onComplete).toHaveBeenCalledWith([
            expect.objectContaining({
                status: 'success',
                request: request1,
                response: expect.objectContaining({ resultDisplay: 'done display' }),
            }),
        ]);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
            await vi.advanceTimersByTimeAsync(0);
        });
        // Wait for second to complete
        await act(async () => {
            await schedulePromise2;
        });
        expect(onComplete).toHaveBeenCalledWith([
            expect.objectContaining({
                status: 'success',
                request: request2,
                response: expect.objectContaining({ resultDisplay: 'done display' }),
            }),
        ]);
        const toolCalls = result.current[0];
        expect(toolCalls).toHaveLength(0);
    });
});
describe('mapToDisplay', () => {
    const baseRequest = {
        callId: 'testCallId',
        name: 'testTool',
        args: { foo: 'bar' },
    };
    const baseTool = new MockTool({
        name: 'testTool',
        displayName: 'Test Tool Display',
        execute: vi.fn(),
        shouldConfirmExecute: vi.fn(),
    });
    const baseResponse = {
        callId: 'testCallId',
        responseParts: [
            {
                functionResponse: {
                    name: 'testTool',
                    id: 'testCallId',
                    response: { output: 'Test output' },
                },
            },
        ],
        resultDisplay: 'Test display output',
        error: undefined,
    };
    const baseInvocation = baseTool.build(baseRequest.args);
    const testCases = [
        {
            name: 'validating',
            status: 'validating',
            extraProps: { tool: baseTool, invocation: baseInvocation },
            expectedStatus: ToolCallStatus.Executing,
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
        {
            name: 'awaiting_approval',
            status: 'awaiting_approval',
            extraProps: {
                tool: baseTool,
                invocation: baseInvocation,
                confirmationDetails: {
                    onConfirm: vi.fn(),
                    type: 'edit',
                    title: 'Test Tool Display',
                    serverName: 'testTool',
                    toolName: 'testTool',
                    toolDisplayName: 'Test Tool Display',
                    filePath: 'mock',
                    fileName: 'test.ts',
                    fileDiff: 'Test diff',
                    originalContent: 'Original content',
                    newContent: 'New content',
                },
            },
            expectedStatus: ToolCallStatus.Confirming,
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
        {
            name: 'scheduled',
            status: 'scheduled',
            extraProps: { tool: baseTool, invocation: baseInvocation },
            expectedStatus: ToolCallStatus.Pending,
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
        {
            name: 'executing no live output',
            status: 'executing',
            extraProps: { tool: baseTool, invocation: baseInvocation },
            expectedStatus: ToolCallStatus.Executing,
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
        {
            name: 'executing with live output',
            status: 'executing',
            extraProps: {
                tool: baseTool,
                invocation: baseInvocation,
                liveOutput: 'Live test output',
            },
            expectedStatus: ToolCallStatus.Executing,
            expectedResultDisplay: 'Live test output',
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
        {
            name: 'success',
            status: 'success',
            extraProps: {
                tool: baseTool,
                invocation: baseInvocation,
                response: baseResponse,
            },
            expectedStatus: ToolCallStatus.Success,
            expectedResultDisplay: baseResponse.resultDisplay,
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
        {
            name: 'error tool not found',
            status: 'error',
            extraProps: {
                response: {
                    ...baseResponse,
                    error: new Error('Test error tool not found'),
                    resultDisplay: 'Error display tool not found',
                },
            },
            expectedStatus: ToolCallStatus.Error,
            expectedResultDisplay: 'Error display tool not found',
            expectedName: baseRequest.name,
            expectedDescription: JSON.stringify(baseRequest.args),
        },
        {
            name: 'error tool execution failed',
            status: 'error',
            extraProps: {
                tool: baseTool,
                response: {
                    ...baseResponse,
                    error: new Error('Tool execution failed'),
                    resultDisplay: 'Execution failed display',
                },
            },
            expectedStatus: ToolCallStatus.Error,
            expectedResultDisplay: 'Execution failed display',
            expectedName: baseTool.displayName, // Changed from baseTool.name
            expectedDescription: JSON.stringify(baseRequest.args),
        },
        {
            name: 'cancelled',
            status: 'cancelled',
            extraProps: {
                tool: baseTool,
                invocation: baseInvocation,
                response: {
                    ...baseResponse,
                    resultDisplay: 'Cancelled display',
                },
            },
            expectedStatus: ToolCallStatus.Canceled,
            expectedResultDisplay: 'Cancelled display',
            expectedName: baseTool.displayName,
            expectedDescription: baseInvocation.getDescription(),
        },
    ];
    testCases.forEach(({ name: testName, status, extraProps, expectedStatus, expectedResultDisplay, expectedName, expectedDescription, }) => {
        it(`should map ToolCall with status '${status}' (${testName}) correctly`, () => {
            const toolCall = {
                request: baseRequest,
                status,
                ...(extraProps || {}),
            };
            const display = mapToDisplay(toolCall);
            expect(display.type).toBe('tool_group');
            expect(display.tools.length).toBe(1);
            const toolDisplay = display.tools[0];
            expect(toolDisplay.callId).toBe(baseRequest.callId);
            expect(toolDisplay.status).toBe(expectedStatus);
            expect(toolDisplay.resultDisplay).toBe(expectedResultDisplay);
            expect(toolDisplay.name).toBe(expectedName);
            expect(toolDisplay.description).toBe(expectedDescription);
            expect(toolDisplay.renderOutputAsMarkdown).toBe(extraProps?.tool?.isOutputMarkdown ?? false);
            if (status === 'awaiting_approval') {
                expect(toolDisplay.confirmationDetails).toBe(extraProps.confirmationDetails);
            }
            else {
                expect(toolDisplay.confirmationDetails).toBeUndefined();
            }
        });
    });
    it('should map an array of ToolCalls correctly', () => {
        const toolCall1 = {
            request: { ...baseRequest, callId: 'call1' },
            status: 'success',
            tool: baseTool,
            invocation: baseTool.build(baseRequest.args),
            response: { ...baseResponse, callId: 'call1' },
        };
        const toolForCall2 = new MockTool({
            name: baseTool.name,
            displayName: baseTool.displayName,
            isOutputMarkdown: true,
            execute: vi.fn(),
            shouldConfirmExecute: vi.fn(),
        });
        const toolCall2 = {
            request: { ...baseRequest, callId: 'call2' },
            status: 'executing',
            tool: toolForCall2,
            invocation: toolForCall2.build(baseRequest.args),
            liveOutput: 'markdown output',
        };
        const display = mapToDisplay([toolCall1, toolCall2]);
        expect(display.tools.length).toBe(2);
        expect(display.tools[0].callId).toBe('call1');
        expect(display.tools[0].status).toBe(ToolCallStatus.Success);
        expect(display.tools[0].renderOutputAsMarkdown).toBe(false);
        expect(display.tools[1].callId).toBe('call2');
        expect(display.tools[1].status).toBe(ToolCallStatus.Executing);
        expect(display.tools[1].resultDisplay).toBe('markdown output');
        expect(display.tools[1].renderOutputAsMarkdown).toBe(true);
    });
});
//# sourceMappingURL=useToolScheduler.test.js.map