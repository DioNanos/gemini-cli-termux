/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { ToolErrorType } from './tool-error.js';
import type { Config } from '../config/config.js';
import { type ModifiableDeclarativeTool, type ModifyContext } from './modifiable-tool.js';
interface ReplacementContext {
    params: EditToolParams;
    currentContent: string;
    abortSignal: AbortSignal;
}
interface ReplacementResult {
    newContent: string;
    occurrences: number;
    finalOldString: string;
    finalNewString: string;
}
export declare function applyReplacement(currentContent: string | null, oldString: string, newString: string, isNewFile: boolean): string;
export declare function calculateReplacement(config: Config, context: ReplacementContext): Promise<ReplacementResult>;
export declare function getErrorReplaceResult(params: EditToolParams, occurrences: number, expectedReplacements: number, finalOldString: string, finalNewString: string): {
    display: string;
    raw: string;
    type: ToolErrorType;
} | undefined;
/**
 * Parameters for the Edit tool
 */
export interface EditToolParams {
    /**
     * The path to the file to modify
     */
    file_path: string;
    /**
     * The text to replace
     */
    old_string: string;
    /**
     * The text to replace it with
     */
    new_string: string;
    /**
     * Number of replacements expected. Defaults to 1 if not specified.
     * Use when you want to replace multiple occurrences.
     */
    expected_replacements?: number;
    /**
     * The instruction for what needs to be done.
     */
    instruction?: string;
    /**
     * Whether the edit was modified manually by the user.
     */
    modified_by_user?: boolean;
    /**
     * Initially proposed content.
     */
    ai_proposed_content?: string;
}
/**
 * Implementation of the Edit tool logic
 */
export declare class EditTool extends BaseDeclarativeTool<EditToolParams, ToolResult> implements ModifiableDeclarativeTool<EditToolParams> {
    private readonly config;
    static readonly Name = "replace";
    constructor(config: Config, messageBus: MessageBus);
    /**
     * Validates the parameters for the Edit tool
     * @param params Parameters to validate
     * @returns Error message string or null if valid
     */
    protected validateToolParamValues(params: EditToolParams): string | null;
    protected createInvocation(params: EditToolParams, messageBus: MessageBus): ToolInvocation<EditToolParams, ToolResult>;
    getModifyContext(_: AbortSignal): ModifyContext<EditToolParams>;
}
export {};
