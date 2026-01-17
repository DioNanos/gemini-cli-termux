/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentResponse, GenerateContentParameters, ToolConfig } from '@google/genai';
/**
 * Decoupled LLM request format - stable across Gemini CLI versions
 */
export interface LLMRequest {
    model: string;
    messages: Array<{
        role: 'user' | 'model' | 'system';
        content: string | Array<{
            type: string;
            [key: string]: unknown;
        }>;
    }>;
    config?: {
        temperature?: number;
        maxOutputTokens?: number;
        topP?: number;
        topK?: number;
        stopSequences?: string[];
        candidateCount?: number;
        presencePenalty?: number;
        frequencyPenalty?: number;
        [key: string]: unknown;
    };
    toolConfig?: HookToolConfig;
}
/**
 * Decoupled LLM response format - stable across Gemini CLI versions
 */
export interface LLMResponse {
    text?: string;
    candidates: Array<{
        content: {
            role: 'model';
            parts: string[];
        };
        finishReason?: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
        index?: number;
        safetyRatings?: Array<{
            category: string;
            probability: string;
            blocked?: boolean;
        }>;
    }>;
    usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
    };
}
/**
 * Decoupled tool configuration - stable across Gemini CLI versions
 */
export interface HookToolConfig {
    mode?: 'AUTO' | 'ANY' | 'NONE';
    allowedFunctionNames?: string[];
}
/**
 * Base class for hook translators - handles version-specific translation logic
 */
export declare abstract class HookTranslator {
    abstract toHookLLMRequest(sdkRequest: GenerateContentParameters): LLMRequest;
    abstract fromHookLLMRequest(hookRequest: LLMRequest, baseRequest?: GenerateContentParameters): GenerateContentParameters;
    abstract toHookLLMResponse(sdkResponse: GenerateContentResponse): LLMResponse;
    abstract fromHookLLMResponse(hookResponse: LLMResponse): GenerateContentResponse;
    abstract toHookToolConfig(sdkToolConfig: ToolConfig): HookToolConfig;
    abstract fromHookToolConfig(hookToolConfig: HookToolConfig): ToolConfig;
}
/**
 * Hook translator for GenAI SDK v1.x
 * Handles translation between GenAI SDK types and stable Hook API types
 */
export declare class HookTranslatorGenAIv1 extends HookTranslator {
    /**
     * Convert genai SDK GenerateContentParameters to stable LLMRequest
     *
     * Note: This implementation intentionally extracts only text content from parts.
     * Non-text parts (images, function calls, etc.) are filtered out in v1 to provide
     * a simplified, stable interface for hooks. This allows hooks to focus on text
     * manipulation without needing to handle complex multimodal content.
     * Future versions may expose additional content types if needed.
     */
    toHookLLMRequest(sdkRequest: GenerateContentParameters): LLMRequest;
    /**
     * Convert stable LLMRequest to genai SDK GenerateContentParameters
     */
    fromHookLLMRequest(hookRequest: LLMRequest, baseRequest?: GenerateContentParameters): GenerateContentParameters;
    /**
     * Convert genai SDK GenerateContentResponse to stable LLMResponse
     */
    toHookLLMResponse(sdkResponse: GenerateContentResponse): LLMResponse;
    /**
     * Convert stable LLMResponse to genai SDK GenerateContentResponse
     */
    fromHookLLMResponse(hookResponse: LLMResponse): GenerateContentResponse;
    /**
     * Convert genai SDK ToolConfig to stable HookToolConfig
     */
    toHookToolConfig(sdkToolConfig: ToolConfig): HookToolConfig;
    /**
     * Convert stable HookToolConfig to genai SDK ToolConfig
     */
    fromHookToolConfig(hookToolConfig: HookToolConfig): ToolConfig;
}
/**
 * Default translator instance for current GenAI SDK version
 */
export declare const defaultHookTranslator: HookTranslatorGenAIv1;
