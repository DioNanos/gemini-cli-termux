/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { MessageBusType, type Message, type HookExecutionRequest, type HookExecutionResponse } from '../confirmation-bus/types.js';
/**
 * Mock MessageBus for testing hook execution through MessageBus
 */
export declare class MockMessageBus {
    private subscriptions;
    publishedMessages: Message[];
    hookRequests: HookExecutionRequest[];
    hookResponses: HookExecutionResponse[];
    defaultToolDecision: 'allow' | 'deny' | 'ask_user';
    /**
     * Mock publish method that captures messages and simulates responses
     */
    publish: import("vitest").Mock<(message: Message) => void>;
    /**
     * Mock subscribe method that stores listeners
     */
    subscribe: import("vitest").Mock<(type: MessageBusType, listener: (message: Message) => void) => void>;
    /**
     * Mock unsubscribe method
     */
    unsubscribe: import("vitest").Mock<(type: MessageBusType, listener: (message: Message) => void) => void>;
    /**
     * Emit a message to subscribers (for testing)
     */
    private emit;
    /**
     * Manually trigger a hook response (for testing custom scenarios)
     */
    triggerHookResponse(correlationId: string, success: boolean, output?: Record<string, unknown>, error?: Error): void;
    /**
     * Get the last hook request published
     */
    getLastHookRequest(): HookExecutionRequest | undefined;
    /**
     * Get all hook requests for a specific event
     */
    getHookRequestsForEvent(eventName: string): HookExecutionRequest[];
    /**
     * Clear all captured messages (for test isolation)
     */
    clear(): void;
    /**
     * Verify that a hook execution request was published
     */
    expectHookRequest(eventName: string, input?: Partial<Record<string, unknown>>): HookExecutionRequest;
}
/**
 * Create a mock MessageBus for testing
 */
export declare function createMockMessageBus(): MessageBus;
/**
 * Get the MockMessageBus instance from a mocked MessageBus
 */
export declare function getMockMessageBusInstance(messageBus: MessageBus): MockMessageBus;
