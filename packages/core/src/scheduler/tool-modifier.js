/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Diff from 'diff';
import { isModifiableDeclarativeTool, modifyWithEditor, } from '../tools/modifiable-tool.js';
export class ToolModificationHandler {
    /**
     * Handles the "Modify with Editor" flow where an external editor is launched
     * to modify the tool's parameters.
     */
    async handleModifyWithEditor(toolCall, editorType, signal) {
        if (!isModifiableDeclarativeTool(toolCall.tool)) {
            return undefined;
        }
        const confirmationDetails = toolCall.confirmationDetails;
        const modifyContext = toolCall.tool.getModifyContext(signal);
        const contentOverrides = confirmationDetails.type === 'edit'
            ? {
                currentContent: confirmationDetails.originalContent,
                proposedContent: confirmationDetails.newContent,
            }
            : undefined;
        const { updatedParams, updatedDiff } = await modifyWithEditor(toolCall.request.args, modifyContext, editorType, signal, contentOverrides);
        return {
            updatedParams,
            updatedDiff,
        };
    }
    /**
     * Applies user-provided inline content updates (e.g. from the chat UI).
     */
    async applyInlineModify(toolCall, payload, signal) {
        if (toolCall.confirmationDetails.type !== 'edit' ||
            !payload.newContent ||
            !isModifiableDeclarativeTool(toolCall.tool)) {
            return undefined;
        }
        const modifyContext = toolCall.tool.getModifyContext(signal);
        const currentContent = await modifyContext.getCurrentContent(toolCall.request.args);
        const updatedParams = modifyContext.createUpdatedParams(currentContent, payload.newContent, toolCall.request.args);
        const updatedDiff = Diff.createPatch(modifyContext.getFilePath(toolCall.request.args), currentContent, payload.newContent, 'Current', 'Proposed');
        return {
            updatedParams,
            updatedDiff,
        };
    }
}
//# sourceMappingURL=tool-modifier.js.map