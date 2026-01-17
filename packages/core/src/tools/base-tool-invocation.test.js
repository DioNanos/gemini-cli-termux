/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseToolInvocation } from './tools.js';
import { MessageBusType, } from '../confirmation-bus/types.js';
class TestBaseToolInvocation extends BaseToolInvocation {
    getDescription() {
        return 'test description';
    }
    async execute() {
        return { llmContent: [], returnDisplay: '' };
    }
}
describe('BaseToolInvocation', () => {
    let messageBus;
    let abortController;
    beforeEach(() => {
        messageBus = {
            publish: vi.fn(),
            subscribe: vi.fn(),
            unsubscribe: vi.fn(),
        };
        abortController = new AbortController();
    });
    it('should propagate serverName to ToolConfirmationRequest', async () => {
        const serverName = 'test-server';
        const tool = new TestBaseToolInvocation({}, messageBus, 'test-tool', 'Test Tool', serverName);
        let capturedRequest;
        vi.mocked(messageBus.publish).mockImplementation(async (request) => {
            if (request.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
                capturedRequest = request;
            }
        });
        let responseHandler;
        vi.mocked(messageBus.subscribe).mockImplementation((type, handler) => {
            if (type === MessageBusType.TOOL_CONFIRMATION_RESPONSE) {
                responseHandler = handler;
            }
        });
        const confirmationPromise = tool.shouldConfirmExecute(abortController.signal);
        // Wait for microtasks to ensure publish is called
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(messageBus.publish).toHaveBeenCalledTimes(1);
        expect(capturedRequest).toBeDefined();
        expect(capturedRequest?.type).toBe(MessageBusType.TOOL_CONFIRMATION_REQUEST);
        expect(capturedRequest?.serverName).toBe(serverName);
        // Simulate response to finish the promise cleanly
        if (responseHandler && capturedRequest) {
            responseHandler({
                type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                correlationId: capturedRequest.correlationId,
                confirmed: true,
            });
        }
        await confirmationPromise;
    });
    it('should NOT propagate serverName if not provided', async () => {
        const tool = new TestBaseToolInvocation({}, messageBus, 'test-tool', 'Test Tool');
        let capturedRequest;
        vi.mocked(messageBus.publish).mockImplementation(async (request) => {
            if (request.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
                capturedRequest = request;
            }
        });
        // We need to mock subscribe to avoid hanging if we want to await the promise,
        // but for this test we just need to check publish.
        // We'll abort to clean up.
        const confirmationPromise = tool.shouldConfirmExecute(abortController.signal);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(messageBus.publish).toHaveBeenCalledTimes(1);
        expect(capturedRequest).toBeDefined();
        expect(capturedRequest?.serverName).toBeUndefined();
        abortController.abort();
        try {
            await confirmationPromise;
        }
        catch {
            // ignore abort error
        }
    });
});
//# sourceMappingURL=base-tool-invocation.test.js.map