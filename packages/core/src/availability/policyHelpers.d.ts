/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentConfig } from '@google/genai';
import type { Config } from '../config/config.js';
import type { FailureKind, FallbackAction, ModelPolicy, ModelPolicyChain, RetryAvailabilityContext } from './modelPolicy.js';
import type { ModelSelectionResult } from './modelAvailabilityService.js';
import type { ModelConfigKey } from '../services/modelConfigService.js';
/**
 * Resolves the active policy chain for the given config, ensuring the
 * user-selected active model is represented.
 */
export declare function resolvePolicyChain(config: Config, preferredModel?: string, wrapsAround?: boolean): ModelPolicyChain;
/**
 * Produces the failed policy (if it exists in the chain) and the list of
 * fallback candidates that follow it.
 * @param chain - The ordered list of available model policies.
 * @param failedModel - The identifier of the model that failed.
 * @param wrapsAround - If true, treats the chain as a circular buffer.
 */
export declare function buildFallbackPolicyContext(chain: ModelPolicyChain, failedModel: string, wrapsAround?: boolean): {
    failedPolicy?: ModelPolicy;
    candidates: ModelPolicy[];
};
export declare function resolvePolicyAction(failureKind: FailureKind, policy: ModelPolicy): FallbackAction;
/**
 * Creates a context provider for retry logic that returns the availability
 * sevice and resolves the current model's policy.
 *
 * @param modelGetter A function that returns the model ID currently being attempted.
 *        (Allows handling dynamic model changes during retries).
 */
export declare function createAvailabilityContextProvider(config: Config, modelGetter: () => string): () => RetryAvailabilityContext | undefined;
/**
 * Selects the model to use for an attempt via the availability service and
 * returns the selection context.
 */
export declare function selectModelForAvailability(config: Config, requestedModel: string): ModelSelectionResult;
/**
 * Applies the model availability selection logic, including side effects
 * (setting active model, consuming sticky attempts) and config updates.
 */
export declare function applyModelSelection(config: Config, modelConfigKey: ModelConfigKey, options?: {
    consumeAttempt?: boolean;
}): {
    model: string;
    config: GenerateContentConfig;
    maxAttempts?: number;
};
export declare function applyAvailabilityTransition(getContext: (() => RetryAvailabilityContext | undefined) | undefined, failureKind: FailureKind): void;
