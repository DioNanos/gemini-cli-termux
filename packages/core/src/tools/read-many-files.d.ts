/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import { type Config } from '../config/config.js';
/**
 * Parameters for the ReadManyFilesTool.
 */
export interface ReadManyFilesParams {
    /**
     * Glob patterns for files to include.
     * Example: ["*.ts", "src/** /*.md"]
     */
    include: string[];
    /**
     * Optional. Glob patterns for files/directories to exclude.
     * Applied as ignore patterns.
     * Example: ["*.log", "dist/**"]
     */
    exclude?: string[];
    /**
     * Optional. Search directories recursively.
     * This is generally controlled by glob patterns (e.g., `**`).
     * The glob implementation is recursive by default for `**`.
     * For simplicity, we'll rely on `**` for recursion.
     */
    recursive?: boolean;
    /**
     * Optional. Apply default exclusion patterns. Defaults to true.
     */
    useDefaultExcludes?: boolean;
    /**
     * Whether to respect .gitignore and .geminiignore patterns (optional, defaults to true)
     */
    file_filtering_options?: {
        respect_git_ignore?: boolean;
        respect_gemini_ignore?: boolean;
    };
}
/**
 * Tool implementation for finding and reading multiple text files from the local filesystem
 * within a specified target directory. The content is concatenated.
 * It is intended to run in an environment with access to the local file system (e.g., a Node.js backend).
 */
export declare class ReadManyFilesTool extends BaseDeclarativeTool<ReadManyFilesParams, ToolResult> {
    private config;
    static readonly Name = "read_many_files";
    constructor(config: Config, messageBus: MessageBus);
    protected createInvocation(params: ReadManyFilesParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<ReadManyFilesParams, ToolResult>;
}
