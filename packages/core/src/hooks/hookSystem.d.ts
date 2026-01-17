/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import { HookRegistry } from './hookRegistry.js';
import { HookEventHandler } from './hookEventHandler.js';
import type { HookRegistryEntry } from './hookRegistry.js';
import type { SessionStartSource, SessionEndReason, PreCompressTrigger, DefaultHookOutput } from './types.js';
import type { AggregatedHookResult } from './hookAggregator.js';
/**
 * Main hook system that coordinates all hook-related functionality
 */
export declare class HookSystem {
    private readonly config;
    private readonly hookRegistry;
    private readonly hookRunner;
    private readonly hookAggregator;
    private readonly hookPlanner;
    private readonly hookEventHandler;
    constructor(config: Config);
    /**
     * Initialize the hook system
     */
    initialize(): Promise<void>;
    /**
     * Get the hook event bus for firing events
     */
    getEventHandler(): HookEventHandler;
    /**
     * Get hook registry for management operations
     */
    getRegistry(): HookRegistry;
    /**
     * Enable or disable a hook
     */
    setHookEnabled(hookName: string, enabled: boolean): void;
    /**
     * Get all registered hooks for display/management
     */
    getAllHooks(): HookRegistryEntry[];
    /**
     * Fire hook events directly
     * Returns undefined if hooks are disabled
     */
    fireSessionStartEvent(source: SessionStartSource): Promise<AggregatedHookResult | undefined>;
    fireSessionEndEvent(reason: SessionEndReason): Promise<AggregatedHookResult | undefined>;
    firePreCompressEvent(trigger: PreCompressTrigger): Promise<AggregatedHookResult | undefined>;
    fireBeforeAgentEvent(prompt: string): Promise<DefaultHookOutput | undefined>;
    fireAfterAgentEvent(prompt: string, response: string, stopHookActive?: boolean): Promise<DefaultHookOutput | undefined>;
}
