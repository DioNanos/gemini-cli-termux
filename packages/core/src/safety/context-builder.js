/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Builds context objects for safety checkers, ensuring sensitive data is filtered.
 */
export class ContextBuilder {
    config;
    conversationHistory;
    constructor(config, conversationHistory = []) {
        this.config = config;
        this.conversationHistory = conversationHistory;
    }
    /**
     * Builds the full context object with all available data.
     */
    buildFullContext() {
        return {
            environment: {
                cwd: process.cwd(),
                workspaces: this.config
                    .getWorkspaceContext()
                    .getDirectories(),
            },
            history: {
                turns: this.conversationHistory,
            },
        };
    }
    /**
     * Builds a minimal context with only the specified keys.
     */
    buildMinimalContext(requiredKeys) {
        const fullContext = this.buildFullContext();
        const minimalContext = {};
        for (const key of requiredKeys) {
            if (key in fullContext) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                minimalContext[key] = fullContext[key];
            }
        }
        return minimalContext;
    }
}
//# sourceMappingURL=context-builder.js.map