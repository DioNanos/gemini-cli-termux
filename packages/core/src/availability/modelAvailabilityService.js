/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export class ModelAvailabilityService {
    health = new Map();
    markTerminal(model, reason) {
        this.setState(model, {
            status: 'terminal',
            reason,
        });
    }
    markHealthy(model) {
        this.clearState(model);
    }
    markRetryOncePerTurn(model) {
        const currentState = this.health.get(model);
        // Do not override a terminal failure with a transient one.
        if (currentState?.status === 'terminal') {
            return;
        }
        // Only reset consumption if we are not already in the sticky_retry state.
        // This prevents infinite loops if the model fails repeatedly in the same turn.
        let consumed = false;
        if (currentState?.status === 'sticky_retry') {
            consumed = currentState.consumed;
        }
        this.setState(model, {
            status: 'sticky_retry',
            reason: 'retry_once_per_turn',
            consumed,
        });
    }
    consumeStickyAttempt(model) {
        const state = this.health.get(model);
        if (state?.status === 'sticky_retry') {
            this.setState(model, { ...state, consumed: true });
        }
    }
    snapshot(model) {
        const state = this.health.get(model);
        if (!state) {
            return { available: true };
        }
        if (state.status === 'terminal') {
            return { available: false, reason: state.reason };
        }
        if (state.status === 'sticky_retry' && state.consumed) {
            return { available: false, reason: state.reason };
        }
        return { available: true };
    }
    selectFirstAvailable(models) {
        const skipped = [];
        for (const model of models) {
            const snapshot = this.snapshot(model);
            if (snapshot.available) {
                const state = this.health.get(model);
                // A sticky model is being attempted, so note that.
                const attempts = state?.status === 'sticky_retry' ? 1 : undefined;
                return { selectedModel: model, skipped, attempts };
            }
            else {
                skipped.push({ model, reason: snapshot.reason ?? 'unknown' });
            }
        }
        return { selectedModel: null, skipped };
    }
    resetTurn() {
        for (const [model, state] of this.health.entries()) {
            if (state.status === 'sticky_retry') {
                this.setState(model, { ...state, consumed: false });
            }
        }
    }
    reset() {
        this.health.clear();
    }
    setState(model, nextState) {
        this.health.set(model, nextState);
    }
    clearState(model) {
        this.health.delete(model);
    }
}
//# sourceMappingURL=modelAvailabilityService.js.map