/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { SettingScope, type LoadedSettings } from '../config/settings.js';
import type { ModifiedScope } from './skillSettings.js';
export type AgentActionStatus = 'success' | 'no-op' | 'error';
/**
 * Metadata representing the result of an agent settings operation.
 */
export interface AgentActionResult {
    status: AgentActionStatus;
    agentName: string;
    action: 'enable' | 'disable';
    /** Scopes where the agent's state was actually changed. */
    modifiedScopes: ModifiedScope[];
    /** Scopes where the agent was already in the desired state. */
    alreadyInStateScopes: ModifiedScope[];
    /** Error message if status is 'error'. */
    error?: string;
}
/**
 * Enables an agent by ensuring it is not disabled in any writable scope (User and Workspace).
 * It sets `agents.overrides.<agentName>.disabled` to `false` if it was found to be `true`.
 */
export declare function enableAgent(settings: LoadedSettings, agentName: string): AgentActionResult;
/**
 * Disables an agent by setting `agents.overrides.<agentName>.disabled` to `true` in the specified scope.
 */
export declare function disableAgent(settings: LoadedSettings, agentName: string, scope: SettingScope): AgentActionResult;
