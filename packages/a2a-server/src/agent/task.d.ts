/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreToolScheduler, type GeminiClient, type CompletedToolCall, type ToolCallRequestInfo, type ServerGeminiStreamEvent, type ToolCallConfirmationDetails, type Config } from '@google/gemini-cli-core';
import type { RequestContext } from '@a2a-js/sdk/server';
import { type ExecutionEventBus } from '@a2a-js/sdk/server';
import type { TaskState, Part } from '@a2a-js/sdk';
import type { CoderAgentMessage, TaskMetadata, ThoughtSummary } from '../types.js';
export declare class Task {
    id: string;
    contextId: string;
    scheduler: CoreToolScheduler;
    config: Config;
    geminiClient: GeminiClient;
    pendingToolConfirmationDetails: Map<string, ToolCallConfirmationDetails>;
    taskState: TaskState;
    eventBus?: ExecutionEventBus;
    completedToolCalls: CompletedToolCall[];
    skipFinalTrueAfterInlineEdit: boolean;
    modelInfo?: string;
    currentPromptId: string | undefined;
    promptCount: number;
    autoExecute: boolean;
    private pendingToolCalls;
    private toolCompletionPromise?;
    private toolCompletionNotifier?;
    private constructor();
    static create(id: string, contextId: string, config: Config, eventBus?: ExecutionEventBus, autoExecute?: boolean): Promise<Task>;
    getMetadata(): Promise<TaskMetadata>;
    private _resetToolCompletionPromise;
    private _registerToolCall;
    private _resolveToolCall;
    waitForPendingTools(): Promise<void>;
    cancelPendingTools(reason: string): void;
    private _createTextMessage;
    private _createStatusUpdateEvent;
    setTaskStateAndPublishUpdate(newState: TaskState, coderAgentMessage: CoderAgentMessage, messageText?: string, messageParts?: Part[], // For more complex messages
    final?: boolean, metadataError?: string, traceId?: string): void;
    private _schedulerOutputUpdate;
    private _schedulerAllToolCallsComplete;
    private _schedulerToolCallsUpdate;
    private createScheduler;
    private _pickFields;
    private toolStatusMessage;
    private getProposedContent;
    private _applyReplacement;
    scheduleToolCalls(requests: ToolCallRequestInfo[], abortSignal: AbortSignal): Promise<void>;
    acceptAgentMessage(event: ServerGeminiStreamEvent): Promise<void>;
    private _handleToolConfirmationPart;
    getAndClearCompletedTools(): CompletedToolCall[];
    addToolResponsesToHistory(completedTools: CompletedToolCall[]): void;
    sendCompletedToolsToLlm(completedToolCalls: CompletedToolCall[], aborted: AbortSignal): AsyncGenerator<ServerGeminiStreamEvent>;
    acceptUserMessage(requestContext: RequestContext, aborted: AbortSignal): AsyncGenerator<ServerGeminiStreamEvent>;
    _sendTextContent(content: string, traceId?: string): void;
    _sendThought(content: ThoughtSummary, traceId?: string): void;
    _sendCitation(citation: string): void;
}
