/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import type { Config } from '../config/config.js';
/**
 * Parameters for the ReadFile tool
 */
export interface ReadFileToolParams {
    /**
     * The path to the file to read
     */
    file_path: string;
    /**
     * The line number to start reading from (optional)
     */
    offset?: number;
    /**
     * The number of lines to read (optional)
     */
    limit?: number;
}
/**
 * Implementation of the ReadFile tool logic
 */
export declare class ReadFileTool extends BaseDeclarativeTool<ReadFileToolParams, ToolResult> {
    private config;
    static readonly Name = "read_file";
    constructor(config: Config, messageBus: MessageBus);
    protected validateToolParamValues(params: ReadFileToolParams): string | null;
    protected createInvocation(params: ReadFileToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<ReadFileToolParams, ToolResult>;
}
