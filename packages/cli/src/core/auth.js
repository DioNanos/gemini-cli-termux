/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { getErrorMessage, } from '@google/gemini-cli-core';
/**
 * Handles the initial authentication flow.
 * @param config The application config.
 * @param authType The selected auth type.
 * @returns An error message if authentication fails, otherwise null.
 */
export async function performInitialAuth(config, authType) {
    if (!authType) {
        return null;
    }
    try {
        await config.refreshAuth(authType);
        // The console.log is intentionally left out here.
        // We can add a dedicated startup message later if needed.
    }
    catch (e) {
        return `Failed to login. Message: ${getErrorMessage(e)}`;
    }
    return null;
}
//# sourceMappingURL=auth.js.map