/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { FunctionCall } from '@google/genai';
import type { SafetyCheckerConfig } from '../policy/types.js';
import type { SafetyCheckResult } from './protocol.js';
import type { CheckerRegistry } from './registry.js';
import type { ContextBuilder } from './context-builder.js';
/**
 * Configuration for the checker runner.
 */
export interface CheckerRunnerConfig {
    /**
     * Maximum time (in milliseconds) to wait for a checker to complete.
     * Default: 5000 (5 seconds)
     */
    timeout?: number;
    /**
     * Path to the directory containing external checkers.
     */
    checkersPath: string;
}
/**
 * Service for executing safety checker processes.
 */
export declare class CheckerRunner {
    private static readonly DEFAULT_TIMEOUT;
    private readonly registry;
    private readonly contextBuilder;
    private readonly timeout;
    constructor(contextBuilder: ContextBuilder, registry: CheckerRegistry, config: CheckerRunnerConfig);
    /**
     * Runs a safety checker and returns the result.
     */
    runChecker(toolCall: FunctionCall, checkerConfig: SafetyCheckerConfig): Promise<SafetyCheckResult>;
    private runInProcessChecker;
    private runExternalChecker;
    /**
     * Executes an external checker process and handles its lifecycle.
     */
    private executeCheckerProcess;
    /**
     * Executes a promise with a timeout.
     */
    private executeWithTimeout;
}
