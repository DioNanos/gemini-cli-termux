/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentResponse, Content, Part, Tool, PartListUnion } from '@google/genai';
import type { Config } from '../config/config.js';
import type { StructuredError } from './turn.js';
import type { CompletedToolCall } from './coreToolScheduler.js';
import { ChatRecordingService, type ResumedSessionData } from '../services/chatRecordingService.js';
import type { ModelConfigKey } from '../services/modelConfigService.js';
export declare enum StreamEventType {
    /** A regular content chunk from the API. */
    CHUNK = "chunk",
    /** A signal that a retry is about to happen. The UI should discard any partial
     * content from the attempt that just failed. */
    RETRY = "retry",
    /** A signal that the agent execution has been stopped by a hook. */
    AGENT_EXECUTION_STOPPED = "agent_execution_stopped",
    /** A signal that the agent execution has been blocked by a hook. */
    AGENT_EXECUTION_BLOCKED = "agent_execution_blocked"
}
export type StreamEvent = {
    type: StreamEventType.CHUNK;
    value: GenerateContentResponse;
} | {
    type: StreamEventType.RETRY;
} | {
    type: StreamEventType.AGENT_EXECUTION_STOPPED;
    reason: string;
} | {
    type: StreamEventType.AGENT_EXECUTION_BLOCKED;
    reason: string;
};
export declare const SYNTHETIC_THOUGHT_SIGNATURE = "skip_thought_signature_validator";
export declare function isValidNonThoughtTextPart(part: Part): boolean;
/**
 * Custom error to signal that a stream completed with invalid content,
 * which should trigger a retry.
 */
export declare class InvalidStreamError extends Error {
    readonly type: 'NO_FINISH_REASON' | 'NO_RESPONSE_TEXT' | 'MALFORMED_FUNCTION_CALL';
    constructor(message: string, type: 'NO_FINISH_REASON' | 'NO_RESPONSE_TEXT' | 'MALFORMED_FUNCTION_CALL');
}
/**
 * Custom error to signal that agent execution has been stopped.
 */
export declare class AgentExecutionStoppedError extends Error {
    reason: string;
    constructor(reason: string);
}
/**
 * Custom error to signal that agent execution has been blocked.
 */
export declare class AgentExecutionBlockedError extends Error {
    reason: string;
    syntheticResponse?: GenerateContentResponse | undefined;
    constructor(reason: string, syntheticResponse?: GenerateContentResponse | undefined);
}
/**
 * Chat session that enables sending messages to the model with previous
 * conversation context.
 *
 * @remarks
 * The session maintains all the turns between user and model.
 */
export declare class GeminiChat {
    private readonly config;
    private systemInstruction;
    private tools;
    private history;
    private sendPromise;
    private readonly chatRecordingService;
    private lastPromptTokenCount;
    constructor(config: Config, systemInstruction?: string, tools?: Tool[], history?: Content[], resumedSessionData?: ResumedSessionData);
    setSystemInstruction(sysInstr: string): void;
    /**
     * Sends a message to the model and returns the response in chunks.
     *
     * @remarks
     * This method will wait for the previous message to be processed before
     * sending the next message.
     *
     * @see {@link Chat#sendMessage} for non-streaming method.
     * @param modelConfigKey - The key for the model config.
     * @param message - The list of messages to send.
     * @param prompt_id - The ID of the prompt.
     * @param signal - An abort signal for this message.
     * @return The model's response.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
     * const response = await chat.sendMessageStream({
     * message: 'Why is the sky blue?'
     * });
     * for await (const chunk of response) {
     * console.log(chunk.text);
     * }
     * ```
     */
    sendMessageStream(modelConfigKey: ModelConfigKey, message: PartListUnion, prompt_id: string, signal: AbortSignal): Promise<AsyncGenerator<StreamEvent>>;
    private makeApiCallAndProcessStream;
    /**
     * Returns the chat history.
     *
     * @remarks
     * The history is a list of contents alternating between user and model.
     *
     * There are two types of history:
     * - The `curated history` contains only the valid turns between user and
     * model, which will be included in the subsequent requests sent to the model.
     * - The `comprehensive history` contains all turns, including invalid or
     * empty model outputs, providing a complete record of the history.
     *
     * The history is updated after receiving the response from the model,
     * for streaming response, it means receiving the last chunk of the response.
     *
     * The `comprehensive history` is returned by default. To get the `curated
     * history`, set the `curated` parameter to `true`.
     *
     * @param curated - whether to return the curated history or the comprehensive
     * history.
     * @return History contents alternating between user and model for the entire
     * chat session.
     */
    getHistory(curated?: boolean): Content[];
    /**
     * Clears the chat history.
     */
    clearHistory(): void;
    /**
     * Adds a new entry to the chat history.
     */
    addHistory(content: Content): void;
    setHistory(history: Content[]): void;
    stripThoughtsFromHistory(): void;
    ensureActiveLoopHasThoughtSignatures(requestContents: Content[]): Content[];
    setTools(tools: Tool[]): void;
    maybeIncludeSchemaDepthContext(error: StructuredError): Promise<void>;
    private processStreamResponse;
    getLastPromptTokenCount(): number;
    /**
     * Gets the chat recording service instance.
     */
    getChatRecordingService(): ChatRecordingService;
    /**
     * Records completed tool calls with full metadata.
     * This is called by external components when tool calls complete, before sending responses to Gemini.
     */
    recordCompletedToolCalls(model: string, toolCalls: CompletedToolCall[]): void;
    /**
     * Extracts and records thought from thought content.
     */
    private recordThoughtFromContent;
}
/** Visible for Testing */
export declare function isSchemaDepthError(errorMessage: string): boolean;
export declare function isInvalidArgumentError(errorMessage: string): boolean;
