/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Creates a ResolvedModelConfig with sensible defaults, allowing overrides.
 */
export const makeResolvedModelConfig = (model, overrides = {}) => ({
    model,
    generateContentConfig: {
        temperature: 0,
        topP: 1,
        ...overrides,
    },
});
//# sourceMappingURL=modelConfigServiceTestUtils.js.map