/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ModelSelectionResult } from '../availability/modelAvailabilityService.js';
import type { FailureKind, FallbackAction, ModelPolicy } from '../availability/modelPolicy.js';
/**
 * Defines the intent returned by the UI layer during a fallback scenario.
 */
export type FallbackIntent = 'retry_always' | 'retry_once' | 'stop' | 'retry_later' | 'upgrade';
export interface FallbackRecommendation extends ModelSelectionResult {
    action: FallbackAction;
    failureKind: FailureKind;
    failedPolicy?: ModelPolicy;
    selectedPolicy: ModelPolicy;
}
/**
 * The interface for the handler provided by the UI layer (e.g., the CLI)
 * to interact with the user during a fallback scenario.
 */
export type FallbackModelHandler = (failedModel: string, fallbackModel: string, error?: unknown) => Promise<FallbackIntent | null>;
