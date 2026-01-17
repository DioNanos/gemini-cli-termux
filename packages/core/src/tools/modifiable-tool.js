/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { openDiff } from '../utils/editor.js';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import * as Diff from 'diff';
import { DEFAULT_DIFF_OPTIONS } from './diffOptions.js';
import { isNodeError } from '../utils/errors.js';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Type guard to check if a declarative tool is modifiable.
 */
export function isModifiableDeclarativeTool(tool) {
    return 'getModifyContext' in tool;
}
function createTempFilesForModify(currentContent, proposedContent, file_path) {
    const diffDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-cli-tool-modify-'));
    try {
        fs.chmodSync(diffDir, 0o700);
    }
    catch (e) {
        debugLogger.error(`Error setting permissions on temp diff directory: ${diffDir}`, e);
        throw e;
    }
    const ext = path.extname(file_path);
    const fileName = path.basename(file_path, ext);
    const timestamp = Date.now();
    const tempOldPath = path.join(diffDir, `gemini-cli-modify-${fileName}-old-${timestamp}${ext}`);
    const tempNewPath = path.join(diffDir, `gemini-cli-modify-${fileName}-new-${timestamp}${ext}`);
    fs.writeFileSync(tempOldPath, currentContent, {
        encoding: 'utf8',
        mode: 0o600,
    });
    fs.writeFileSync(tempNewPath, proposedContent, {
        encoding: 'utf8',
        mode: 0o600,
    });
    return { oldPath: tempOldPath, newPath: tempNewPath, dirPath: diffDir };
}
function getUpdatedParams(tmpOldPath, tempNewPath, originalParams, modifyContext) {
    let oldContent = '';
    let newContent = '';
    try {
        oldContent = fs.readFileSync(tmpOldPath, 'utf8');
    }
    catch (err) {
        if (!isNodeError(err) || err.code !== 'ENOENT')
            throw err;
        oldContent = '';
    }
    try {
        newContent = fs.readFileSync(tempNewPath, 'utf8');
    }
    catch (err) {
        if (!isNodeError(err) || err.code !== 'ENOENT')
            throw err;
        newContent = '';
    }
    const updatedParams = modifyContext.createUpdatedParams(oldContent, newContent, originalParams);
    const updatedDiff = Diff.createPatch(path.basename(modifyContext.getFilePath(originalParams)), oldContent, newContent, 'Current', 'Proposed', DEFAULT_DIFF_OPTIONS);
    return { updatedParams, updatedDiff };
}
function deleteTempFiles(oldPath, newPath, dirPath) {
    try {
        fs.unlinkSync(oldPath);
    }
    catch {
        debugLogger.error(`Error deleting temp diff file: ${oldPath}`);
    }
    try {
        fs.unlinkSync(newPath);
    }
    catch {
        debugLogger.error(`Error deleting temp diff file: ${newPath}`);
    }
    try {
        fs.rmdirSync(dirPath);
    }
    catch {
        debugLogger.error(`Error deleting temp diff directory: ${dirPath}`);
    }
}
/**
 * Triggers an external editor for the user to modify the proposed content,
 * and returns the updated tool parameters and the diff after the user has modified the proposed content.
 */
export async function modifyWithEditor(originalParams, modifyContext, editorType, _abortSignal, overrides) {
    const hasCurrentOverride = overrides !== undefined && 'currentContent' in overrides;
    const hasProposedOverride = overrides !== undefined && 'proposedContent' in overrides;
    const currentContent = hasCurrentOverride
        ? (overrides.currentContent ?? '')
        : await modifyContext.getCurrentContent(originalParams);
    const proposedContent = hasProposedOverride
        ? (overrides.proposedContent ?? '')
        : await modifyContext.getProposedContent(originalParams);
    const { oldPath, newPath, dirPath } = createTempFilesForModify(currentContent ?? '', proposedContent ?? '', modifyContext.getFilePath(originalParams));
    try {
        await openDiff(oldPath, newPath, editorType);
        const result = getUpdatedParams(oldPath, newPath, originalParams, modifyContext);
        return result;
    }
    finally {
        deleteTempFiles(oldPath, newPath, dirPath);
    }
}
//# sourceMappingURL=modifiable-tool.js.map