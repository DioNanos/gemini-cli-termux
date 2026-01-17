/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { Config } from '../config/config.js';
/**
 * Parses a prompt to extract valid URLs and identify malformed ones.
 */
export declare function parsePrompt(text: string): {
    validUrls: string[];
    errors: string[];
};
/**
 * Parameters for the WebFetch tool
 */
export interface WebFetchToolParams {
    /**
     * The prompt containing URL(s) (up to 20) and instructions for processing their content.
     */
    prompt: string;
}
/**
 * Implementation of the WebFetch tool logic
 */
export declare class WebFetchTool extends BaseDeclarativeTool<WebFetchToolParams, ToolResult> {
    private readonly config;
    static readonly Name = "web_fetch";
    constructor(config: Config, messageBus: MessageBus);
    protected validateToolParamValues(params: WebFetchToolParams): string | null;
    protected createInvocation(params: WebFetchToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<WebFetchToolParams, ToolResult>;
}
