/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { DEFAULT_GEMINI_MODEL } from '../../config/models.js';
export class DefaultStrategy {
    name = 'default';
    async route(_context, _config, _baseLlmClient) {
        return {
            model: DEFAULT_GEMINI_MODEL,
            metadata: {
                source: this.name,
                latencyMs: 0,
                reasoning: `Routing to default model: ${DEFAULT_GEMINI_MODEL}`,
            },
        };
    }
}
//# sourceMappingURL=defaultStrategy.js.map