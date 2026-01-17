/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HookRegistry } from './hookRegistry.js';
import type { HookExecutionPlan } from './types.js';
import { type HookEventName } from './types.js';
/**
 * Hook planner that selects matching hooks and creates execution plans
 */
export declare class HookPlanner {
    private readonly hookRegistry;
    constructor(hookRegistry: HookRegistry);
    /**
     * Create execution plan for a hook event
     */
    createExecutionPlan(eventName: HookEventName, context?: HookEventContext): HookExecutionPlan | null;
    /**
     * Check if a hook entry matches the given context
     */
    private matchesContext;
    /**
     * Match tool name against matcher pattern
     */
    private matchesToolName;
    /**
     * Match trigger/source against matcher pattern
     */
    private matchesTrigger;
    /**
     * Deduplicate identical hook configurations
     */
    private deduplicateHooks;
}
/**
 * Context information for hook event matching
 */
export interface HookEventContext {
    toolName?: string;
    trigger?: string;
}
