/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
/**
 * Parameters for the GetInternalDocs tool.
 */
export interface GetInternalDocsParams {
    /**
     * The relative path to a specific documentation file (e.g., 'cli/commands.md').
     * If omitted, the tool will return a list of all available documentation paths.
     */
    path?: string;
}
/**
 * A tool that provides access to Gemini CLI's internal documentation.
 * If no path is provided, it returns a list of all available documentation files.
 * If a path is provided, it returns the content of that specific file.
 */
export declare class GetInternalDocsTool extends BaseDeclarativeTool<GetInternalDocsParams, ToolResult> {
    static readonly Name = "get_internal_docs";
    constructor(messageBus: MessageBus);
    protected createInvocation(params: GetInternalDocsParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<GetInternalDocsParams, ToolResult>;
}
