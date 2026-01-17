/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type FunctionCall } from '@google/genai';
import { PolicyDecision, type PolicyEngineConfig, type PolicyRule, type SafetyCheckerRule, type HookCheckerRule, type HookExecutionContext, ApprovalMode } from './types.js';
import type { CheckerRunner } from '../safety/checker-runner.js';
import type { HookExecutionRequest } from '../confirmation-bus/types.js';
export declare class PolicyEngine {
    private rules;
    private checkers;
    private hookCheckers;
    private readonly defaultDecision;
    private readonly nonInteractive;
    private readonly checkerRunner?;
    private readonly allowHooks;
    private approvalMode;
    constructor(config?: PolicyEngineConfig, checkerRunner?: CheckerRunner);
    /**
     * Update the current approval mode.
     */
    setApprovalMode(mode: ApprovalMode): void;
    /**
     * Get the current approval mode.
     */
    getApprovalMode(): ApprovalMode;
    /**
     * Check if a shell command is allowed.
     */
    private checkShellCommand;
    /**
     * Check if a tool call is allowed based on the configured policies.
     * Returns the decision and the matching rule (if any).
     */
    check(toolCall: FunctionCall, serverName: string | undefined): Promise<{
        decision: PolicyDecision;
        rule?: PolicyRule;
    }>;
    /**
     * Add a new rule to the policy engine.
     */
    addRule(rule: PolicyRule): void;
    addChecker(checker: SafetyCheckerRule): void;
    /**
     * Remove rules for a specific tool.
     */
    removeRulesForTool(toolName: string): void;
    /**
     * Get all current rules.
     */
    getRules(): readonly PolicyRule[];
    getCheckers(): readonly SafetyCheckerRule[];
    /**
     * Add a new hook checker to the policy engine.
     */
    addHookChecker(checker: HookCheckerRule): void;
    /**
     * Get all current hook checkers.
     */
    getHookCheckers(): readonly HookCheckerRule[];
    /**
     * Check if a hook execution is allowed based on the configured policies.
     * Runs hook-specific safety checkers if configured.
     */
    checkHook(request: HookExecutionRequest | HookExecutionContext): Promise<PolicyDecision>;
    private applyNonInteractiveMode;
}
