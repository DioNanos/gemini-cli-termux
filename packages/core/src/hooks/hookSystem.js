/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { HookRegistry } from './hookRegistry.js';
import { HookRunner } from './hookRunner.js';
import { HookAggregator } from './hookAggregator.js';
import { HookPlanner } from './hookPlanner.js';
import { HookEventHandler } from './hookEventHandler.js';
import { logs } from '@opentelemetry/api-logs';
import { SERVICE_NAME } from '../telemetry/constants.js';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Main hook system that coordinates all hook-related functionality
 */
export class HookSystem {
    config;
    hookRegistry;
    hookRunner;
    hookAggregator;
    hookPlanner;
    hookEventHandler;
    constructor(config) {
        this.config = config;
        const logger = logs.getLogger(SERVICE_NAME);
        const messageBus = config.getMessageBus();
        // Initialize components
        this.hookRegistry = new HookRegistry(config);
        this.hookRunner = new HookRunner(config);
        this.hookAggregator = new HookAggregator();
        this.hookPlanner = new HookPlanner(this.hookRegistry);
        this.hookEventHandler = new HookEventHandler(config, logger, this.hookPlanner, this.hookRunner, this.hookAggregator, messageBus);
    }
    /**
     * Initialize the hook system
     */
    async initialize() {
        await this.hookRegistry.initialize();
        debugLogger.debug('Hook system initialized successfully');
    }
    /**
     * Get the hook event bus for firing events
     */
    getEventHandler() {
        return this.hookEventHandler;
    }
    /**
     * Get hook registry for management operations
     */
    getRegistry() {
        return this.hookRegistry;
    }
    /**
     * Enable or disable a hook
     */
    setHookEnabled(hookName, enabled) {
        this.hookRegistry.setHookEnabled(hookName, enabled);
    }
    /**
     * Get all registered hooks for display/management
     */
    getAllHooks() {
        return this.hookRegistry.getAllHooks();
    }
    /**
     * Fire hook events directly
     * Returns undefined if hooks are disabled
     */
    async fireSessionStartEvent(source) {
        if (!this.config.getEnableHooks()) {
            return undefined;
        }
        return this.hookEventHandler.fireSessionStartEvent(source);
    }
    async fireSessionEndEvent(reason) {
        if (!this.config.getEnableHooks()) {
            return undefined;
        }
        return this.hookEventHandler.fireSessionEndEvent(reason);
    }
    async firePreCompressEvent(trigger) {
        if (!this.config.getEnableHooks()) {
            return undefined;
        }
        return this.hookEventHandler.firePreCompressEvent(trigger);
    }
    async fireBeforeAgentEvent(prompt) {
        if (!this.config.getEnableHooks()) {
            return undefined;
        }
        const result = await this.hookEventHandler.fireBeforeAgentEvent(prompt);
        return result.finalOutput;
    }
    async fireAfterAgentEvent(prompt, response, stopHookActive = false) {
        if (!this.config.getEnableHooks()) {
            return undefined;
        }
        const result = await this.hookEventHandler.fireAfterAgentEvent(prompt, response, stopHookActive);
        return result.finalOutput;
    }
}
//# sourceMappingURL=hookSystem.js.map