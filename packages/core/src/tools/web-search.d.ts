/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { GroundingMetadata } from '@google/genai';
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import { type Config } from '../config/config.js';
interface GroundingChunkWeb {
    uri?: string;
    title?: string;
}
interface GroundingChunkItem {
    web?: GroundingChunkWeb;
}
/**
 * Parameters for the WebSearchTool.
 */
export interface WebSearchToolParams {
    /**
     * The search query.
     */
    query: string;
}
/**
 * Extends ToolResult to include sources for web search.
 */
export interface WebSearchToolResult extends ToolResult {
    sources?: GroundingMetadata extends {
        groundingChunks: GroundingChunkItem[];
    } ? GroundingMetadata['groundingChunks'] : GroundingChunkItem[];
}
/**
 * A tool to perform web searches using Google Search via the Gemini API.
 */
export declare class WebSearchTool extends BaseDeclarativeTool<WebSearchToolParams, WebSearchToolResult> {
    private readonly config;
    static readonly Name = "google_web_search";
    constructor(config: Config, messageBus: MessageBus);
    /**
     * Validates the parameters for the WebSearchTool.
     * @param params The parameters to validate
     * @returns An error message string if validation fails, null if valid
     */
    protected validateToolParamValues(params: WebSearchToolParams): string | null;
    protected createInvocation(params: WebSearchToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<WebSearchToolParams, WebSearchToolResult>;
}
export {};
