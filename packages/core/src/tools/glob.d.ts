/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import { type Config } from '../config/config.js';
export interface GlobPath {
    fullpath(): string;
    mtimeMs?: number;
}
/**
 * Sorts file entries based on recency and then alphabetically.
 * Recent files (modified within recencyThresholdMs) are listed first, newest to oldest.
 * Older files are listed after recent ones, sorted alphabetically by path.
 */
export declare function sortFileEntries(entries: GlobPath[], nowTimestamp: number, recencyThresholdMs: number): GlobPath[];
/**
 * Parameters for the GlobTool
 */
export interface GlobToolParams {
    /**
     * The glob pattern to match files against
     */
    pattern: string;
    /**
     * The directory to search in (optional, defaults to current directory)
     */
    dir_path?: string;
    /**
     * Whether the search should be case-sensitive (optional, defaults to false)
     */
    case_sensitive?: boolean;
    /**
     * Whether to respect .gitignore patterns (optional, defaults to true)
     */
    respect_git_ignore?: boolean;
    /**
     * Whether to respect .geminiignore patterns (optional, defaults to true)
     */
    respect_gemini_ignore?: boolean;
}
/**
 * Implementation of the Glob tool logic
 */
export declare class GlobTool extends BaseDeclarativeTool<GlobToolParams, ToolResult> {
    private config;
    static readonly Name = "glob";
    constructor(config: Config, messageBus: MessageBus);
    /**
     * Validates the parameters for the tool.
     */
    protected validateToolParamValues(params: GlobToolParams): string | null;
    protected createInvocation(params: GlobToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<GlobToolParams, ToolResult>;
}
