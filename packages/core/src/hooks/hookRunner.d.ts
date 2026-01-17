/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HookConfig } from './types.js';
import { HookEventName } from './types.js';
import type { Config } from '../config/config.js';
import type { HookInput, HookExecutionResult } from './types.js';
/**
 * Hook runner that executes command hooks
 */
export declare class HookRunner {
    private readonly config;
    constructor(config: Config);
    /**
     * Execute a single hook
     */
    executeHook(hookConfig: HookConfig, eventName: HookEventName, input: HookInput): Promise<HookExecutionResult>;
    /**
     * Execute multiple hooks in parallel
     */
    executeHooksParallel(hookConfigs: HookConfig[], eventName: HookEventName, input: HookInput, onHookStart?: (config: HookConfig, index: number) => void, onHookEnd?: (config: HookConfig, result: HookExecutionResult) => void): Promise<HookExecutionResult[]>;
    /**
     * Execute multiple hooks sequentially
     */
    executeHooksSequential(hookConfigs: HookConfig[], eventName: HookEventName, input: HookInput, onHookStart?: (config: HookConfig, index: number) => void, onHookEnd?: (config: HookConfig, result: HookExecutionResult) => void): Promise<HookExecutionResult[]>;
    /**
     * Apply hook output to modify input for the next hook in sequential execution
     */
    private applyHookOutputToInput;
    /**
     * Execute a command hook
     */
    private executeCommandHook;
    /**
     * Expand command with environment variables and input context
     */
    private expandCommand;
    /**
     * Convert plain text output to structured HookOutput
     */
    private convertPlainTextToHookOutput;
}
