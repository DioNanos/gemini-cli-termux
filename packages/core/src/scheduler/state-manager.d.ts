/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ToolCall, CompletedToolCall, ExecutingToolCall, ToolCallResponseInfo } from './types.js';
import type { ToolConfirmationOutcome, AnyToolInvocation, ToolCallConfirmationDetails } from '../tools/tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { type SerializableConfirmationDetails } from '../confirmation-bus/types.js';
/**
 * Manages the state of tool calls.
 * Publishes state changes to the MessageBus via TOOL_CALLS_UPDATE events.
 */
export declare class SchedulerStateManager {
    private readonly messageBus;
    private readonly activeCalls;
    private readonly queue;
    private _completedBatch;
    constructor(messageBus: MessageBus);
    addToolCalls(calls: ToolCall[]): void;
    getToolCall(callId: string): ToolCall | undefined;
    enqueue(calls: ToolCall[]): void;
    dequeue(): ToolCall | undefined;
    get isActive(): boolean;
    get activeCallCount(): number;
    get queueLength(): number;
    get firstActiveCall(): ToolCall | undefined;
    /**
     * Updates the status of a tool call with specific auxiliary data required for certain states.
     */
    updateStatus(callId: string, status: 'success', data: ToolCallResponseInfo): void;
    updateStatus(callId: string, status: 'error', data: ToolCallResponseInfo): void;
    updateStatus(callId: string, status: 'awaiting_approval', data: ToolCallConfirmationDetails | {
        correlationId: string;
        confirmationDetails: SerializableConfirmationDetails;
    }): void;
    updateStatus(callId: string, status: 'cancelled', data: string): void;
    updateStatus(callId: string, status: 'executing', data?: Partial<ExecutingToolCall>): void;
    updateStatus(callId: string, status: 'scheduled' | 'validating'): void;
    finalizeCall(callId: string): void;
    updateArgs(callId: string, newArgs: Record<string, unknown>, newInvocation: AnyToolInvocation): void;
    setOutcome(callId: string, outcome: ToolConfirmationOutcome): void;
    cancelAllQueued(reason: string): void;
    getSnapshot(): ToolCall[];
    clearBatch(): void;
    get completedBatch(): CompletedToolCall[];
    private emitUpdate;
    private isTerminalCall;
    private transitionCall;
    private isToolCallResponseInfo;
    private isExecutingToolCallPatch;
    /**
     * Ensures the tool call has an associated tool and invocation before
     * transitioning to states that require them.
     */
    private validateHasToolAndInvocation;
    private toSuccess;
    private toError;
    private toAwaitingApproval;
    private isEventDrivenApprovalData;
    private toScheduled;
    private toCancelled;
    private isWaitingToolCall;
    private patchCall;
    private toValidating;
    private toExecuting;
}
