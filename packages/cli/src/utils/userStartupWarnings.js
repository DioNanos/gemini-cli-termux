/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { homedir } from '@google/gemini-cli-core';
import { isFolderTrustEnabled, isWorkspaceTrusted, } from '../config/trustedFolders.js';
// Individual warning checks
const homeDirectoryCheck = {
    id: 'home-directory',
    check: async (workspaceRoot, settings) => {
        if (settings.ui?.showHomeDirectoryWarning === false) {
            return null;
        }
        try {
            const [workspaceRealPath, homeRealPath] = await Promise.all([
                fs.realpath(workspaceRoot),
                fs.realpath(homedir()),
            ]);
            if (workspaceRealPath === homeRealPath) {
                // If folder trust is enabled and user trusts home directory, don't show warning.
                if (isFolderTrustEnabled(settings) &&
                    isWorkspaceTrusted(settings).isTrusted) {
                    return null;
                }
                return 'Warning you are running Gemini CLI in your home directory.\nThis warning can be disabled in /settings';
            }
            return null;
        }
        catch (_err) {
            return 'Could not verify current directory due to a file system error.';
        }
    },
};
const rootDirectoryCheck = {
    id: 'root-directory',
    check: async (workspaceRoot, _settings) => {
        try {
            const workspaceRealPath = await fs.realpath(workspaceRoot);
            const errorMessage = 'Warning: You are running Gemini CLI in the root directory. Your entire folder structure will be used for context. It is strongly recommended to run in a project-specific directory.';
            // Check for Unix root directory
            if (path.dirname(workspaceRealPath) === workspaceRealPath) {
                return errorMessage;
            }
            return null;
        }
        catch (_err) {
            return 'Could not verify current directory due to a file system error.';
        }
    },
};
// All warning checks
const WARNING_CHECKS = [
    homeDirectoryCheck,
    rootDirectoryCheck,
];
export async function getUserStartupWarnings(settings, workspaceRoot = process.cwd()) {
    // TERMUX PATCH: If hideBanner is true, skip all startup warnings
    if (settings.ui?.hideBanner) {
        return [];
    }
    const results = await Promise.all(WARNING_CHECKS.map((check) => check.check(workspaceRoot, settings)));
    return results.filter((msg) => msg !== null);
}
//# sourceMappingURL=userStartupWarnings.js.map