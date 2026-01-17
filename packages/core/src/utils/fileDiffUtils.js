/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Safely extracts the FileDiff object from a tool call's resultDisplay.
 * This helper performs runtime checks to ensure the object conforms to the FileDiff structure.
 * @param resultDisplay The resultDisplay property of a ToolCallRecord.
 * @returns The FileDiff object if found and valid, otherwise undefined.
 */
export function getFileDiffFromResultDisplay(resultDisplay) {
    if (resultDisplay &&
        typeof resultDisplay === 'object' &&
        'diffStat' in resultDisplay &&
        typeof resultDisplay.diffStat === 'object' &&
        resultDisplay.diffStat !== null) {
        const diffStat = resultDisplay.diffStat;
        if (diffStat) {
            return resultDisplay;
        }
    }
    return undefined;
}
export function computeAddedAndRemovedLines(stats) {
    if (!stats) {
        return {
            addedLines: 0,
            removedLines: 0,
        };
    }
    return {
        addedLines: stats.model_added_lines + stats.user_added_lines,
        removedLines: stats.model_removed_lines + stats.user_removed_lines,
    };
}
//# sourceMappingURL=fileDiffUtils.js.map