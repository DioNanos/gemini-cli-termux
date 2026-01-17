/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { vi } from 'vitest';
import { MessageBusType, } from '../confirmation-bus/types.js';
/**
 * Mock MessageBus for testing hook execution through MessageBus
 */
export class MockMessageBus {
    subscriptions = new Map();
    publishedMessages = [];
    hookRequests = [];
    hookResponses = [];
    defaultToolDecision = 'allow';
    /**
     * Mock publish method that captures messages and simulates responses
     */
    publish = vi.fn((message) => {
        this.publishedMessages.push(message);
        // Capture hook-specific messages
        if (message.type === MessageBusType.HOOK_EXECUTION_REQUEST) {
            this.hookRequests.push(message);
            // Auto-respond with success for testing
            const response = {
                type: MessageBusType.HOOK_EXECUTION_RESPONSE,
                correlationId: message.correlationId,
                success: true,
                output: {
                    decision: 'allow',
                    reason: 'Mock hook execution successful',
                },
            };
            this.hookResponses.push(response);
            // Emit response to subscribers
            this.emit(MessageBusType.HOOK_EXECUTION_RESPONSE, response);
        }
        // Handle tool confirmation requests
        if (message.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
            if (this.defaultToolDecision === 'allow') {
                this.emit(MessageBusType.TOOL_CONFIRMATION_RESPONSE, {
                    type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                    correlationId: message.correlationId,
                    confirmed: true,
                });
            }
            else if (this.defaultToolDecision === 'deny') {
                this.emit(MessageBusType.TOOL_CONFIRMATION_RESPONSE, {
                    type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                    correlationId: message.correlationId,
                    confirmed: false,
                });
            }
            else {
                // ask_user
                this.emit(MessageBusType.TOOL_CONFIRMATION_RESPONSE, {
                    type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                    correlationId: message.correlationId,
                    confirmed: false,
                    requiresUserConfirmation: true,
                });
            }
        }
        // Emit the message to subscribers (mimicking real MessageBus behavior)
        this.emit(message.type, message);
    });
    /**
     * Mock subscribe method that stores listeners
     */
    subscribe = vi.fn((type, listener) => {
        if (!this.subscriptions.has(type)) {
            this.subscriptions.set(type, new Set());
        }
        this.subscriptions.get(type).add(listener);
    });
    /**
     * Mock unsubscribe method
     */
    unsubscribe = vi.fn((type, listener) => {
        const listeners = this.subscriptions.get(type);
        if (listeners) {
            listeners.delete(listener);
        }
    });
    /**
     * Emit a message to subscribers (for testing)
     */
    emit(type, message) {
        const listeners = this.subscriptions.get(type);
        if (listeners) {
            listeners.forEach((listener) => listener(message));
        }
    }
    /**
     * Manually trigger a hook response (for testing custom scenarios)
     */
    triggerHookResponse(correlationId, success, output, error) {
        const response = {
            type: MessageBusType.HOOK_EXECUTION_RESPONSE,
            correlationId,
            success,
            output,
            error,
        };
        this.hookResponses.push(response);
        this.emit(MessageBusType.HOOK_EXECUTION_RESPONSE, response);
    }
    /**
     * Get the last hook request published
     */
    getLastHookRequest() {
        return this.hookRequests[this.hookRequests.length - 1];
    }
    /**
     * Get all hook requests for a specific event
     */
    getHookRequestsForEvent(eventName) {
        return this.hookRequests.filter((req) => req.eventName === eventName);
    }
    /**
     * Clear all captured messages (for test isolation)
     */
    clear() {
        this.publishedMessages = [];
        this.hookRequests = [];
        this.hookResponses = [];
        this.subscriptions.clear();
    }
    /**
     * Verify that a hook execution request was published
     */
    expectHookRequest(eventName, input) {
        const request = this.hookRequests.find((req) => req.eventName === eventName);
        if (!request) {
            throw new Error(`Expected hook request for event "${eventName}" but none was found`);
        }
        if (input) {
            Object.entries(input).forEach(([key, value]) => {
                if (request.input[key] !== value) {
                    throw new Error(`Expected hook input.${key} to be ${JSON.stringify(value)} but got ${JSON.stringify(request.input[key])}`);
                }
            });
        }
        return request;
    }
}
/**
 * Create a mock MessageBus for testing
 */
export function createMockMessageBus() {
    return new MockMessageBus();
}
/**
 * Get the MockMessageBus instance from a mocked MessageBus
 */
export function getMockMessageBusInstance(messageBus) {
    return messageBus;
}
//# sourceMappingURL=mock-message-bus.js.map