/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, beforeEach, afterEach, vi, } from 'vitest';
import { BaseToolInvocation, BaseDeclarativeTool, Kind, } from './tools.js';
import { MessageBus } from '../confirmation-bus/message-bus.js';
import { PolicyEngine } from '../policy/policy-engine.js';
import { MessageBusType, } from '../confirmation-bus/types.js';
import { randomUUID } from 'node:crypto';
// Mock crypto module
vi.mock('node:crypto', () => ({
    randomUUID: vi.fn(),
}));
class TestToolInvocation extends BaseToolInvocation {
    getDescription() {
        return `Test tool with param: ${this.params.testParam}`;
    }
    async execute() {
        return {
            llmContent: `Executed with ${this.params.testParam}`,
            returnDisplay: `Test result: ${this.params.testParam}`,
            testValue: this.params.testParam,
        };
    }
    async shouldConfirmExecute(abortSignal) {
        const decision = await this.getMessageBusDecision(abortSignal);
        if (decision === 'ALLOW') {
            return false;
        }
        if (decision === 'DENY') {
            throw new Error('Tool execution denied by policy');
        }
        return false;
    }
}
class TestTool extends BaseDeclarativeTool {
    constructor(messageBus) {
        super('test-tool', 'Test Tool', 'A test tool for message bus integration', Kind.Other, {
            type: 'object',
            properties: {
                testParam: { type: 'string' },
            },
            required: ['testParam'],
        }, messageBus, true, false);
    }
    createInvocation(params, messageBus, _toolName, _toolDisplayName) {
        return new TestToolInvocation(params, messageBus, _toolName, _toolDisplayName);
    }
}
describe('Message Bus Integration', () => {
    let policyEngine;
    let messageBus;
    let mockUUID;
    beforeEach(() => {
        vi.resetAllMocks();
        policyEngine = new PolicyEngine();
        messageBus = new MessageBus(policyEngine);
        mockUUID = vi.mocked(randomUUID);
        mockUUID.mockReturnValue('test-correlation-id');
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe('BaseToolInvocation with MessageBus', () => {
        it('should use message bus for confirmation when available', async () => {
            const tool = new TestTool(messageBus);
            const invocation = tool.build({ testParam: 'test-value' });
            // Mock message bus publish and subscribe
            const publishSpy = vi.spyOn(messageBus, 'publish');
            const subscribeSpy = vi.spyOn(messageBus, 'subscribe');
            const unsubscribeSpy = vi.spyOn(messageBus, 'unsubscribe');
            // Start confirmation process
            const confirmationPromise = invocation.shouldConfirmExecute(new AbortController().signal);
            // Verify confirmation request was published
            expect(publishSpy).toHaveBeenCalledWith({
                type: MessageBusType.TOOL_CONFIRMATION_REQUEST,
                toolCall: {
                    name: 'test-tool',
                    args: { testParam: 'test-value' },
                },
                correlationId: 'test-correlation-id',
            });
            // Verify subscription to response
            expect(subscribeSpy).toHaveBeenCalledWith(MessageBusType.TOOL_CONFIRMATION_RESPONSE, expect.any(Function));
            // Simulate confirmation response
            const responseHandler = subscribeSpy.mock.calls[0][1];
            const response = {
                type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                correlationId: 'test-correlation-id',
                confirmed: true,
            };
            responseHandler(response);
            const result = await confirmationPromise;
            expect(result).toBe(false); // No further confirmation needed
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
        it('should reject promise when confirmation is denied', async () => {
            const tool = new TestTool(messageBus);
            const invocation = tool.build({ testParam: 'test-value' });
            const subscribeSpy = vi.spyOn(messageBus, 'subscribe');
            const confirmationPromise = invocation.shouldConfirmExecute(new AbortController().signal);
            // Simulate denial response
            const responseHandler = subscribeSpy.mock.calls[0][1];
            const response = {
                type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                correlationId: 'test-correlation-id',
                confirmed: false,
            };
            responseHandler(response);
            // Should reject with error when denied
            await expect(confirmationPromise).rejects.toThrow('Tool execution denied by policy');
        });
        it('should handle timeout', async () => {
            vi.useFakeTimers();
            const tool = new TestTool(messageBus);
            const invocation = tool.build({ testParam: 'test-value' });
            const confirmationPromise = invocation.shouldConfirmExecute(new AbortController().signal);
            // Fast-forward past timeout
            vi.advanceTimersByTime(30000);
            const result = await confirmationPromise;
            expect(result).toBe(false);
            vi.useRealTimers();
        });
        it('should handle abort signal', async () => {
            const tool = new TestTool(messageBus);
            const invocation = tool.build({ testParam: 'test-value' });
            const abortController = new AbortController();
            const confirmationPromise = invocation.shouldConfirmExecute(abortController.signal);
            // Abort the operation
            abortController.abort();
            await expect(confirmationPromise).rejects.toThrow('Tool execution denied by policy');
        });
        it('should ignore responses with wrong correlation ID', async () => {
            vi.useFakeTimers();
            const tool = new TestTool(messageBus);
            const invocation = tool.build({ testParam: 'test-value' });
            const subscribeSpy = vi.spyOn(messageBus, 'subscribe');
            const confirmationPromise = invocation.shouldConfirmExecute(new AbortController().signal);
            // Send response with wrong correlation ID
            const responseHandler = subscribeSpy.mock.calls[0][1];
            const wrongResponse = {
                type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                correlationId: 'wrong-id',
                confirmed: true,
            };
            responseHandler(wrongResponse);
            // Should timeout since correct response wasn't received
            vi.advanceTimersByTime(30000);
            const result = await confirmationPromise;
            expect(result).toBe(false);
            vi.useRealTimers();
        });
    });
    describe('Error Handling', () => {
        it('should handle message bus publish errors gracefully', async () => {
            const tool = new TestTool(messageBus);
            const invocation = tool.build({ testParam: 'test-value' });
            // Mock publish to throw error
            vi.spyOn(messageBus, 'publish').mockImplementation(() => {
                throw new Error('Message bus error');
            });
            const result = await invocation.shouldConfirmExecute(new AbortController().signal);
            expect(result).toBe(false); // Should gracefully fall back
        });
    });
});
//# sourceMappingURL=message-bus-integration.test.js.map