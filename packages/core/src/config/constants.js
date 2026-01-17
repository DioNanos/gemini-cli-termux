/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// For memory files
export const DEFAULT_MEMORY_FILE_FILTERING_OPTIONS = {
    respectGitIgnore: false,
    respectGeminiIgnore: true,
    maxFileCount: 20000,
    searchTimeout: 5000,
};
// For all other files
export const DEFAULT_FILE_FILTERING_OPTIONS = {
    respectGitIgnore: true,
    respectGeminiIgnore: true,
    maxFileCount: 20000,
    searchTimeout: 5000,
};
//# sourceMappingURL=constants.js.map