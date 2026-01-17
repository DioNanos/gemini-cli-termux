/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentResponse, GenerateContentParameters, GenerateContentConfig, ContentListUnion, ToolConfig, ToolListUnion } from '@google/genai';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
/**
 * Result from firing the BeforeModel hook.
 */
export interface BeforeModelHookResult {
    /** Whether the model call was blocked */
    blocked: boolean;
    /** Whether the execution should be stopped entirely */
    stopped?: boolean;
    /** Reason for blocking (if blocked) */
    reason?: string;
    /** Synthetic response to return instead of calling the model (if blocked) */
    syntheticResponse?: GenerateContentResponse;
    /** Modified config (if not blocked) */
    modifiedConfig?: GenerateContentConfig;
    /** Modified contents (if not blocked) */
    modifiedContents?: ContentListUnion;
}
/**
 * Result from firing the BeforeToolSelection hook.
 */
export interface BeforeToolSelectionHookResult {
    /** Modified tool config */
    toolConfig?: ToolConfig;
    /** Modified tools */
    tools?: ToolListUnion;
}
/**
 * Result from firing the AfterModel hook.
 * Contains either a modified response or indicates to use the original chunk.
 */
export interface AfterModelHookResult {
    /** The response to yield (either modified or original) */
    response: GenerateContentResponse;
    /** Whether the execution should be stopped entirely */
    stopped?: boolean;
    /** Whether the model call was blocked */
    blocked?: boolean;
    /** Reason for blocking or stopping */
    reason?: string;
}
/**
 * Fires the BeforeModel hook and returns the result.
 */
export declare function fireBeforeModelHook(messageBus: MessageBus, llmRequest: GenerateContentParameters): Promise<BeforeModelHookResult>;
/**
 * Fires the BeforeToolSelection hook and returns the result.
 *
 * @param messageBus The message bus to use for hook communication
 * @param llmRequest The LLM request parameters
 * @returns The hook result with tool configuration modifications
 */
export declare function fireBeforeToolSelectionHook(messageBus: MessageBus, llmRequest: GenerateContentParameters): Promise<BeforeToolSelectionHookResult>;
/**
 * Fires the AfterModel hook and returns the result.
 *
 * @param messageBus The message bus to use for hook communication
 * @param originalRequest The original LLM request parameters
 * @param chunk The current response chunk from the model
 * @returns The hook result containing the response to yield
 */
export declare function fireAfterModelHook(messageBus: MessageBus, originalRequest: GenerateContentParameters, chunk: GenerateContentResponse): Promise<AfterModelHookResult>;
