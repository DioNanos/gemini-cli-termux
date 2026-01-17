/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { DEFAULT_GEMINI_FLASH_MODEL, DEFAULT_GEMINI_MODEL, PREVIEW_GEMINI_FLASH_MODEL, PREVIEW_GEMINI_MODEL, } from '../config/models.js';
const DEFAULT_ACTIONS = {
    terminal: 'prompt',
    transient: 'prompt',
    not_found: 'prompt',
    unknown: 'prompt',
};
const DEFAULT_STATE = {
    terminal: 'terminal',
    transient: 'terminal',
    not_found: 'terminal',
    unknown: 'terminal',
};
const DEFAULT_CHAIN = [
    definePolicy({ model: DEFAULT_GEMINI_MODEL }),
    definePolicy({ model: DEFAULT_GEMINI_FLASH_MODEL, isLastResort: true }),
];
const PREVIEW_CHAIN = [
    definePolicy({ model: PREVIEW_GEMINI_MODEL }),
    definePolicy({ model: PREVIEW_GEMINI_FLASH_MODEL, isLastResort: true }),
];
/**
 * Returns the default ordered model policy chain for the user.
 */
export function getModelPolicyChain(options) {
    if (options.previewEnabled) {
        return cloneChain(PREVIEW_CHAIN);
    }
    return cloneChain(DEFAULT_CHAIN);
}
export function createSingleModelChain(model) {
    return [definePolicy({ model, isLastResort: true })];
}
/**
 * Provides a default policy scaffold for models not present in the catalog.
 */
export function createDefaultPolicy(model, options) {
    return definePolicy({ model, isLastResort: options?.isLastResort });
}
export function validateModelPolicyChain(chain) {
    if (chain.length === 0) {
        throw new Error('Model policy chain must include at least one model.');
    }
    const lastResortCount = chain.filter((policy) => policy.isLastResort).length;
    if (lastResortCount === 0) {
        throw new Error('Model policy chain must include an `isLastResort` model.');
    }
    if (lastResortCount > 1) {
        throw new Error('Model policy chain must only have one `isLastResort`.');
    }
}
/**
 * Helper to define a ModelPolicy with default actions and state transitions.
 * Ensures every policy is a fresh instance to avoid shared state.
 */
function definePolicy(config) {
    return {
        model: config.model,
        isLastResort: config.isLastResort,
        actions: { ...DEFAULT_ACTIONS, ...(config.actions ?? {}) },
        stateTransitions: {
            ...DEFAULT_STATE,
            ...(config.stateTransitions ?? {}),
        },
    };
}
function clonePolicy(policy) {
    return {
        ...policy,
        actions: { ...policy.actions },
        stateTransitions: { ...policy.stateTransitions },
    };
}
function cloneChain(chain) {
    return chain.map(clonePolicy);
}
//# sourceMappingURL=policyCatalog.js.map