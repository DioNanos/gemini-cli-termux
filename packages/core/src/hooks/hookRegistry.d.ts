/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { HookConfig } from './types.js';
import { HookEventName, ConfigSource } from './types.js';
/**
 * Hook registry entry with source information
 */
export interface HookRegistryEntry {
    config: HookConfig;
    source: ConfigSource;
    eventName: HookEventName;
    matcher?: string;
    sequential?: boolean;
    enabled: boolean;
}
/**
 * Hook registry that loads and validates hook definitions from multiple sources
 */
export declare class HookRegistry {
    private readonly config;
    private entries;
    constructor(config: Config);
    /**
     * Initialize the registry by processing hooks from config
     */
    initialize(): Promise<void>;
    /**
     * Get all hook entries for a specific event
     */
    getHooksForEvent(eventName: HookEventName): HookRegistryEntry[];
    /**
     * Get all registered hooks
     */
    getAllHooks(): HookRegistryEntry[];
    /**
     * Enable or disable a specific hook
     */
    setHookEnabled(hookName: string, enabled: boolean): void;
    /**
     * Get hook name for identification and display purposes
     */
    private getHookName;
    /**
     * Check for untrusted project hooks and warn the user
     */
    private checkProjectHooksTrust;
    /**
     * Process hooks from the config that was already loaded by the CLI
     */
    private processHooksFromConfig;
    /**
     * Process hooks configuration and add entries
     */
    private processHooksConfiguration;
    /**
     * Process a single hook definition
     */
    private processHookDefinition;
    /**
     * Validate a hook configuration
     */
    private validateHookConfig;
    /**
     * Check if an event name is valid
     */
    private isValidEventName;
    /**
     * Get source priority (lower number = higher priority)
     */
    private getSourcePriority;
}
