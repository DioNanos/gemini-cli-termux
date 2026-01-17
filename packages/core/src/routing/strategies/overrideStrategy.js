/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { isAutoModel, resolveModel } from '../../config/models.js';
/**
 * Handles cases where the user explicitly specifies a model (override).
 */
export class OverrideStrategy {
    name = 'override';
    async route(context, config, _baseLlmClient) {
        const overrideModel = context.requestedModel ?? config.getModel();
        // If the model is 'auto' we should pass to the next strategy.
        if (isAutoModel(overrideModel)) {
            return null;
        }
        // Return the overridden model name.
        return {
            model: resolveModel(overrideModel, config.getPreviewFeatures()),
            metadata: {
                source: this.name,
                latencyMs: 0,
                reasoning: `Routing bypassed by forced model directive. Using: ${overrideModel}`,
            },
        };
    }
}
//# sourceMappingURL=overrideStrategy.js.map