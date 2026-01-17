/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export type ModelId = string;
type TerminalUnavailabilityReason = 'quota' | 'capacity';
export type TurnUnavailabilityReason = 'retry_once_per_turn';
export type UnavailabilityReason = TerminalUnavailabilityReason | TurnUnavailabilityReason | 'unknown';
export type ModelHealthStatus = 'terminal' | 'sticky_retry';
export interface ModelAvailabilitySnapshot {
    available: boolean;
    reason?: UnavailabilityReason;
}
export interface ModelSelectionResult {
    selectedModel: ModelId | null;
    attempts?: number;
    skipped: Array<{
        model: ModelId;
        reason: UnavailabilityReason;
    }>;
}
export declare class ModelAvailabilityService {
    private readonly health;
    markTerminal(model: ModelId, reason: TerminalUnavailabilityReason): void;
    markHealthy(model: ModelId): void;
    markRetryOncePerTurn(model: ModelId): void;
    consumeStickyAttempt(model: ModelId): void;
    snapshot(model: ModelId): ModelAvailabilitySnapshot;
    selectFirstAvailable(models: ModelId[]): ModelSelectionResult;
    resetTurn(): void;
    reset(): void;
    private setState;
    private clearState;
}
export {};
