/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PartListUnion, GenerateContentResponse, FunctionDeclaration, FinishReason, GenerateContentResponseUsageMetadata } from '@google/genai';
import type { ToolCallConfirmationDetails, ToolResult } from '../tools/tools.js';
import type { GeminiChat } from './geminiChat.js';
import { type ThoughtSummary } from '../utils/thoughtUtils.js';
import type { ModelConfigKey } from '../services/modelConfigService.js';
import { type ToolCallRequestInfo, type ToolCallResponseInfo } from '../scheduler/types.js';
export interface ServerTool {
    name: string;
    schema: FunctionDeclaration;
    execute(params: Record<string, unknown>, signal?: AbortSignal): Promise<ToolResult>;
    shouldConfirmExecute(params: Record<string, unknown>, abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
}
export declare enum GeminiEventType {
    Content = "content",
    ToolCallRequest = "tool_call_request",
    ToolCallResponse = "tool_call_response",
    ToolCallConfirmation = "tool_call_confirmation",
    UserCancelled = "user_cancelled",
    Error = "error",
    ChatCompressed = "chat_compressed",
    Thought = "thought",
    MaxSessionTurns = "max_session_turns",
    Finished = "finished",
    LoopDetected = "loop_detected",
    Citation = "citation",
    Retry = "retry",
    ContextWindowWillOverflow = "context_window_will_overflow",
    InvalidStream = "invalid_stream",
    ModelInfo = "model_info",
    AgentExecutionStopped = "agent_execution_stopped",
    AgentExecutionBlocked = "agent_execution_blocked"
}
export type ServerGeminiRetryEvent = {
    type: GeminiEventType.Retry;
};
export type ServerGeminiAgentExecutionStoppedEvent = {
    type: GeminiEventType.AgentExecutionStopped;
    value: {
        reason: string;
        systemMessage?: string;
    };
};
export type ServerGeminiAgentExecutionBlockedEvent = {
    type: GeminiEventType.AgentExecutionBlocked;
    value: {
        reason: string;
        systemMessage?: string;
    };
};
export type ServerGeminiContextWindowWillOverflowEvent = {
    type: GeminiEventType.ContextWindowWillOverflow;
    value: {
        estimatedRequestTokenCount: number;
        remainingTokenCount: number;
    };
};
export type ServerGeminiInvalidStreamEvent = {
    type: GeminiEventType.InvalidStream;
};
export type ServerGeminiModelInfoEvent = {
    type: GeminiEventType.ModelInfo;
    value: string;
};
export interface StructuredError {
    message: string;
    status?: number;
}
export interface GeminiErrorEventValue {
    error: StructuredError;
}
export interface GeminiFinishedEventValue {
    reason: FinishReason | undefined;
    usageMetadata: GenerateContentResponseUsageMetadata | undefined;
}
export interface ServerToolCallConfirmationDetails {
    request: ToolCallRequestInfo;
    details: ToolCallConfirmationDetails;
}
export type ServerGeminiContentEvent = {
    type: GeminiEventType.Content;
    value: string;
    traceId?: string;
};
export type ServerGeminiThoughtEvent = {
    type: GeminiEventType.Thought;
    value: ThoughtSummary;
    traceId?: string;
};
export type ServerGeminiToolCallRequestEvent = {
    type: GeminiEventType.ToolCallRequest;
    value: ToolCallRequestInfo;
};
export type ServerGeminiToolCallResponseEvent = {
    type: GeminiEventType.ToolCallResponse;
    value: ToolCallResponseInfo;
};
export type ServerGeminiToolCallConfirmationEvent = {
    type: GeminiEventType.ToolCallConfirmation;
    value: ServerToolCallConfirmationDetails;
};
export type ServerGeminiUserCancelledEvent = {
    type: GeminiEventType.UserCancelled;
};
export type ServerGeminiErrorEvent = {
    type: GeminiEventType.Error;
    value: GeminiErrorEventValue;
};
export declare enum CompressionStatus {
    /** The compression was successful */
    COMPRESSED = 1,
    /** The compression failed due to the compression inflating the token count */
    COMPRESSION_FAILED_INFLATED_TOKEN_COUNT = 2,
    /** The compression failed due to an error counting tokens */
    COMPRESSION_FAILED_TOKEN_COUNT_ERROR = 3,
    /** The compression was not necessary and no action was taken */
    NOOP = 4
}
export interface ChatCompressionInfo {
    originalTokenCount: number;
    newTokenCount: number;
    compressionStatus: CompressionStatus;
}
export type ServerGeminiChatCompressedEvent = {
    type: GeminiEventType.ChatCompressed;
    value: ChatCompressionInfo | null;
};
export type ServerGeminiMaxSessionTurnsEvent = {
    type: GeminiEventType.MaxSessionTurns;
};
export type ServerGeminiFinishedEvent = {
    type: GeminiEventType.Finished;
    value: GeminiFinishedEventValue;
};
export type ServerGeminiLoopDetectedEvent = {
    type: GeminiEventType.LoopDetected;
};
export type ServerGeminiCitationEvent = {
    type: GeminiEventType.Citation;
    value: string;
};
export type ServerGeminiStreamEvent = ServerGeminiChatCompressedEvent | ServerGeminiCitationEvent | ServerGeminiContentEvent | ServerGeminiErrorEvent | ServerGeminiFinishedEvent | ServerGeminiLoopDetectedEvent | ServerGeminiMaxSessionTurnsEvent | ServerGeminiThoughtEvent | ServerGeminiToolCallConfirmationEvent | ServerGeminiToolCallRequestEvent | ServerGeminiToolCallResponseEvent | ServerGeminiUserCancelledEvent | ServerGeminiRetryEvent | ServerGeminiContextWindowWillOverflowEvent | ServerGeminiInvalidStreamEvent | ServerGeminiModelInfoEvent | ServerGeminiAgentExecutionStoppedEvent | ServerGeminiAgentExecutionBlockedEvent;
export declare class Turn {
    private readonly chat;
    private readonly prompt_id;
    readonly pendingToolCalls: ToolCallRequestInfo[];
    private debugResponses;
    private pendingCitations;
    finishReason: FinishReason | undefined;
    constructor(chat: GeminiChat, prompt_id: string);
    run(modelConfigKey: ModelConfigKey, req: PartListUnion, signal: AbortSignal): AsyncGenerator<ServerGeminiStreamEvent>;
    private handlePendingFunctionCall;
    getDebugResponses(): GenerateContentResponse[];
    /**
     * Get the concatenated response text from all responses in this turn.
     * This extracts and joins all text content from the model's responses.
     */
    getResponseText(): string;
}
