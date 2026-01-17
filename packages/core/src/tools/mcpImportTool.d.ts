/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { Config } from '../config/config.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
interface McpImportParams {
    categories?: string[];
    scope?: string;
    target?: 'base' | 'user';
    entries?: Array<{
        key?: string;
        text?: string;
        scope?: string;
        tags?: string[];
        expiresAt?: string;
        sensitivity?: 'low' | 'medium' | 'high';
        source?: string;
        confidence?: number;
    }>;
    payload?: Record<string, unknown>;
}
export declare class McpImportTool extends BaseDeclarativeTool<McpImportParams, ToolResult> {
    private readonly config;
    static readonly Name = "mcp_import_memory";
    constructor(config: Config, messageBus: MessageBus);
    protected createInvocation(params: McpImportParams, messageBus: MessageBus, toolName?: string, displayName?: string): ToolInvocation<McpImportParams, ToolResult>;
}
export {};
