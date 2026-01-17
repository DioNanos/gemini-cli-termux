/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type PolicyEngineConfig, type ApprovalMode, type PolicySettings } from './types.js';
import type { PolicyEngine } from './policy-engine.js';
import { type PolicyFileError } from './toml-loader.js';
import { type MessageBus } from '../confirmation-bus/message-bus.js';
export declare const DEFAULT_CORE_POLICIES_DIR: string;
export declare const DEFAULT_POLICY_TIER = 1;
export declare const USER_POLICY_TIER = 2;
export declare const ADMIN_POLICY_TIER = 3;
/**
 * Gets the list of directories to search for policy files, in order of increasing priority
 * (Default -> User -> Admin).
 *
 * @param defaultPoliciesDir Optional path to a directory containing default policies.
 */
export declare function getPolicyDirectories(defaultPoliciesDir?: string): string[];
/**
 * Determines the policy tier (1=default, 2=user, 3=admin) for a given directory.
 * This is used by the TOML loader to assign priority bands.
 */
export declare function getPolicyTier(dir: string, defaultPoliciesDir?: string): number;
/**
 * Formats a policy file error for console logging.
 */
export declare function formatPolicyError(error: PolicyFileError): string;
export declare function createPolicyEngineConfig(settings: PolicySettings, approvalMode: ApprovalMode, defaultPoliciesDir?: string): Promise<PolicyEngineConfig>;
export declare function createPolicyUpdater(policyEngine: PolicyEngine, messageBus: MessageBus): void;
