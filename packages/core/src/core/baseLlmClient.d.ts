/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Content, Part, GenerateContentResponse } from '@google/genai';
import type { Config } from '../config/config.js';
import type { ContentGenerator } from './contentGenerator.js';
import type { AuthType } from './contentGenerator.js';
import type { ModelConfigKey } from '../services/modelConfigService.js';
/**
 * Options for the generateJson utility function.
 */
export interface GenerateJsonOptions {
    /** The desired model config. */
    modelConfigKey: ModelConfigKey;
    /** The input prompt or history. */
    contents: Content[];
    /** The required JSON schema for the output. */
    schema: Record<string, unknown>;
    /**
     * Task-specific system instructions.
     * If omitted, no system instruction is sent.
     */
    systemInstruction?: string | Part | Part[] | Content;
    /** Signal for cancellation. */
    abortSignal: AbortSignal;
    /**
     * A unique ID for the prompt, used for logging/telemetry correlation.
     */
    promptId: string;
    /**
     * The maximum number of attempts for the request.
     */
    maxAttempts?: number;
}
/**
 * Options for the generateContent utility function.
 */
export interface GenerateContentOptions {
    /** The desired model config. */
    modelConfigKey: ModelConfigKey;
    /** The input prompt or history. */
    contents: Content[];
    /**
     * Task-specific system instructions.
     * If omitted, no system instruction is sent.
     */
    systemInstruction?: string | Part | Part[] | Content;
    /** Signal for cancellation. */
    abortSignal: AbortSignal;
    /**
     * A unique ID for the prompt, used for logging/telemetry correlation.
     */
    promptId: string;
    /**
     * The maximum number of attempts for the request.
     */
    maxAttempts?: number;
}
/**
 * A client dedicated to stateless, utility-focused LLM calls.
 */
export declare class BaseLlmClient {
    private readonly contentGenerator;
    private readonly config;
    private readonly authType?;
    constructor(contentGenerator: ContentGenerator, config: Config, authType?: AuthType | undefined);
    generateJson(options: GenerateJsonOptions): Promise<Record<string, unknown>>;
    generateEmbedding(texts: string[]): Promise<number[][]>;
    private cleanJsonResponse;
    generateContent(options: GenerateContentOptions): Promise<GenerateContentResponse>;
    private _generateWithRetry;
}
