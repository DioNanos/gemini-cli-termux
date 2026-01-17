/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { createPolicyEngineConfig as createCorePolicyEngineConfig, createPolicyUpdater as createCorePolicyUpdater, } from '@google/gemini-cli-core';
import {} from './settings.js';
export async function createPolicyEngineConfig(settings, approvalMode) {
    // Explicitly construct PolicySettings from Settings to ensure type safety
    // and avoid accidental leakage of other settings properties.
    const policySettings = {
        mcp: settings.mcp,
        tools: settings.tools,
        mcpServers: settings.mcpServers,
    };
    return createCorePolicyEngineConfig(policySettings, approvalMode);
}
export function createPolicyUpdater(policyEngine, messageBus) {
    return createCorePolicyUpdater(policyEngine, messageBus);
}
//# sourceMappingURL=policy.js.map