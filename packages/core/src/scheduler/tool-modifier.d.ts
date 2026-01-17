/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { EditorType } from '../utils/editor.js';
import type { ToolConfirmationPayload } from '../tools/tools.js';
import type { WaitingToolCall } from './types.js';
export interface ModificationResult {
    updatedParams: Record<string, unknown>;
    updatedDiff?: string;
}
export declare class ToolModificationHandler {
    /**
     * Handles the "Modify with Editor" flow where an external editor is launched
     * to modify the tool's parameters.
     */
    handleModifyWithEditor(toolCall: WaitingToolCall, editorType: EditorType, signal: AbortSignal): Promise<ModificationResult | undefined>;
    /**
     * Applies user-provided inline content updates (e.g. from the chat UI).
     */
    applyInlineModify(toolCall: WaitingToolCall, payload: ToolConfirmationPayload, signal: AbortSignal): Promise<ModificationResult | undefined>;
}
