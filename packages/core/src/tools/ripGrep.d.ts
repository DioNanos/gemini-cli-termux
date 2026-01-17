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
 * Checks if `rg` exists, if not then attempt to download it.
 */
export declare function canUseRipgrep(): Promise<boolean>;
/**
 * Ensures `rg` is downloaded, or throws.
 */
export declare function ensureRgPath(): Promise<string>;
/**
 * Parameters for the GrepTool
 */
export interface RipGrepToolParams {
    /**
     * The regular expression pattern to search for in file contents
     */
    pattern: string;
    /**
     * The directory to search in (optional, defaults to current directory relative to root)
     */
    dir_path?: string;
    /**
     * File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")
     */
    include?: string;
    /**
     * If true, searches case-sensitively. Defaults to false.
     */
    case_sensitive?: boolean;
    /**
     * If true, treats pattern as a literal string. Defaults to false.
     */
    fixed_strings?: boolean;
    /**
     * Show num lines of context around each match.
     */
    context?: number;
    /**
     * Show num lines after each match.
     */
    after?: number;
    /**
     * Show num lines before each match.
     */
    before?: number;
    /**
     * If true, does not respect .gitignore or default ignores (like build/dist).
     */
    no_ignore?: boolean;
}
/**
 * Implementation of the Grep tool logic (moved from CLI)
 */
export declare class RipGrepTool extends BaseDeclarativeTool<RipGrepToolParams, ToolResult> {
    private readonly config;
    static readonly Name = "search_file_content";
    private readonly geminiIgnoreParser;
    constructor(config: Config, messageBus: MessageBus);
    /**
     * Validates the parameters for the tool
     * @param params Parameters to validate
     * @returns An error message string if invalid, null otherwise
     */
    validateToolParams(params: RipGrepToolParams): string | null;
    protected createInvocation(params: RipGrepToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<RipGrepToolParams, ToolResult>;
}
