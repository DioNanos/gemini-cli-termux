/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type PolicyEngineConfig, type ApprovalMode, type PolicyEngine, type MessageBus } from '@google/gemini-cli-core';
import { type Settings } from './settings.js';
export declare function createPolicyEngineConfig(settings: Settings, approvalMode: ApprovalMode): Promise<PolicyEngineConfig>;
export declare function createPolicyUpdater(policyEngine: PolicyEngine, messageBus: MessageBus): void;
