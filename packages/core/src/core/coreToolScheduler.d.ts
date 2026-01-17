/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ToolConfirmationPayload, ToolConfirmationOutcome } from '../tools/tools.js';
import type { EditorType } from '../utils/editor.js';
import type { Config } from '../config/config.js';
import { type ToolCall, type ValidatingToolCall, type ScheduledToolCall, type ErroredToolCall, type SuccessfulToolCall, type ExecutingToolCall, type CancelledToolCall, type WaitingToolCall, type Status, type CompletedToolCall, type ConfirmHandler, type OutputUpdateHandler, type AllToolCallsCompleteHandler, type ToolCallsUpdateHandler, type ToolCallRequestInfo, type ToolCallResponseInfo } from '../scheduler/types.js';
export type { ToolCall, ValidatingToolCall, ScheduledToolCall, ErroredToolCall, SuccessfulToolCall, ExecutingToolCall, CancelledToolCall, WaitingToolCall, Status, CompletedToolCall, ConfirmHandler, OutputUpdateHandler, AllToolCallsCompleteHandler, ToolCallsUpdateHandler, ToolCallRequestInfo, ToolCallResponseInfo, };
export declare const PLAN_MODE_DENIAL_MESSAGE = "You are in Plan Mode - adjust your prompt to only use read and search tools.";
interface CoreToolSchedulerOptions {
    config: Config;
    outputUpdateHandler?: OutputUpdateHandler;
    onAllToolCallsComplete?: AllToolCallsCompleteHandler;
    onToolCallsUpdate?: ToolCallsUpdateHandler;
    getPreferredEditor: () => EditorType | undefined;
}
export declare class CoreToolScheduler {
    private static subscribedMessageBuses;
    private toolCalls;
    private outputUpdateHandler?;
    private onAllToolCallsComplete?;
    private onToolCallsUpdate?;
    private getPreferredEditor;
    private config;
    private isFinalizingToolCalls;
    private isScheduling;
    private isCancelling;
    private requestQueue;
    private toolCallQueue;
    private completedToolCallsForBatch;
    private toolExecutor;
    private toolModifier;
    constructor(options: CoreToolSchedulerOptions);
    private setStatusInternal;
    private setArgsInternal;
    private isRunning;
    private buildInvocation;
    schedule(request: ToolCallRequestInfo | ToolCallRequestInfo[], signal: AbortSignal): Promise<void>;
    cancelAll(signal: AbortSignal): void;
    private _schedule;
    private _processNextInQueue;
    handleConfirmationResponse(callId: string, originalOnConfirm: (outcome: ToolConfirmationOutcome) => Promise<void>, outcome: ToolConfirmationOutcome, signal: AbortSignal, payload?: ToolConfirmationPayload): Promise<void>;
    private attemptExecutionOfScheduledCalls;
    private checkAndNotifyCompletion;
    private _cancelAllQueuedCalls;
    private notifyToolCallsUpdate;
    private setToolCallOutcome;
}
