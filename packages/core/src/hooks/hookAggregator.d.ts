/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HookOutput, HookExecutionResult } from './types.js';
import { DefaultHookOutput } from './types.js';
import { HookEventName } from './types.js';
/**
 * Aggregated hook result
 */
export interface AggregatedHookResult {
    success: boolean;
    finalOutput?: DefaultHookOutput;
    allOutputs: HookOutput[];
    errors: Error[];
    totalDuration: number;
}
/**
 * Hook aggregator that merges results from multiple hooks using event-specific strategies
 */
export declare class HookAggregator {
    /**
     * Aggregate results from multiple hook executions
     */
    aggregateResults(results: HookExecutionResult[], eventName: HookEventName): AggregatedHookResult;
    /**
     * Merge hook outputs using event-specific strategies
     *
     * Note: We always use the merge logic even for single hooks to ensure
     * consistent default behaviors (e.g., default decision='allow' for OR logic)
     */
    private mergeOutputs;
    /**
     * Merge outputs with OR decision logic and message concatenation
     */
    private mergeWithOrDecision;
    /**
     * Merge outputs with later fields replacing earlier fields
     */
    private mergeWithFieldReplacement;
    /**
     * Merge tool selection outputs with specific logic for tool config
     *
     * Tool Selection Strategy:
     * - The intent is to provide a UNION of tools from all hooks
     * - If any hook specifies NONE mode, no tools are available (most restrictive wins)
     * - If any hook specifies ANY mode (and no NONE), ANY mode is used
     * - Otherwise AUTO mode is used
     * - Function names are collected from all hooks and sorted for deterministic caching
     *
     * This means hooks can only add/enable tools, not filter them out individually.
     * If one hook restricts and another re-enables, the union takes the re-enabled tool.
     */
    private mergeToolSelectionOutputs;
    /**
     * Simple merge for events without special logic
     */
    private mergeSimple;
    /**
     * Create the appropriate specific hook output class based on event type
     */
    private createSpecificHookOutput;
    /**
     * Extract additional context from hook-specific outputs
     */
    private extractAdditionalContext;
}
