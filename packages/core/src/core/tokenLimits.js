/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { DEFAULT_GEMINI_FLASH_LITE_MODEL, DEFAULT_GEMINI_FLASH_MODEL, DEFAULT_GEMINI_MODEL, PREVIEW_GEMINI_FLASH_MODEL, PREVIEW_GEMINI_MODEL, } from '../config/models.js';
export const DEFAULT_TOKEN_LIMIT = 1_048_576;
export function tokenLimit(model) {
    // Add other models as they become relevant or if specified by config
    // Pulled from https://ai.google.dev/gemini-api/docs/models
    switch (model) {
        case PREVIEW_GEMINI_MODEL:
        case PREVIEW_GEMINI_FLASH_MODEL:
        case DEFAULT_GEMINI_MODEL:
        case DEFAULT_GEMINI_FLASH_MODEL:
        case DEFAULT_GEMINI_FLASH_LITE_MODEL:
            return 1_048_576;
        default:
            return DEFAULT_TOKEN_LIMIT;
    }
}
//# sourceMappingURL=tokenLimits.js.map