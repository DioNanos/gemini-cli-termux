/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ModelPolicy, ModelPolicyChain } from './modelPolicy.js';
import type { UserTierId } from '../code_assist/types.js';
export interface ModelPolicyOptions {
    previewEnabled: boolean;
    userTier?: UserTierId;
}
/**
 * Returns the default ordered model policy chain for the user.
 */
export declare function getModelPolicyChain(options: ModelPolicyOptions): ModelPolicyChain;
export declare function createSingleModelChain(model: string): ModelPolicyChain;
/**
 * Provides a default policy scaffold for models not present in the catalog.
 */
export declare function createDefaultPolicy(model: string, options?: {
    isLastResort?: boolean;
}): ModelPolicy;
export declare function validateModelPolicyChain(chain: ModelPolicyChain): void;
