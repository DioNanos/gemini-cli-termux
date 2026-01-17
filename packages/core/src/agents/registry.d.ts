/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { AgentDefinition } from './types.js';
import { type z } from 'zod';
/**
 * Returns the model config alias for a given agent definition.
 */
export declare function getModelConfigAlias<TOutput extends z.ZodTypeAny>(definition: AgentDefinition<TOutput>): string;
/**
 * Manages the discovery, loading, validation, and registration of
 * AgentDefinitions.
 */
export declare class AgentRegistry {
    private readonly config;
    private readonly agents;
    constructor(config: Config);
    /**
     * Discovers and loads agents.
     */
    initialize(): Promise<void>;
    private onModelChanged;
    /**
     * Clears the current registry and re-scans for agents.
     */
    reload(): Promise<void>;
    /**
     * Disposes of resources and removes event listeners.
     */
    dispose(): void;
    private loadAgents;
    private loadBuiltInAgents;
    private refreshAgents;
    /**
     * Registers an agent definition. If an agent with the same name exists,
     * it will be overwritten, respecting the precedence established by the
     * initialization order.
     */
    protected registerAgent<TOutput extends z.ZodTypeAny>(definition: AgentDefinition<TOutput>): Promise<void>;
    /**
     * Registers a local agent definition synchronously.
     */
    protected registerLocalAgent<TOutput extends z.ZodTypeAny>(definition: AgentDefinition<TOutput>): void;
    private isAgentEnabled;
    /**
     * Registers a remote agent definition asynchronously.
     */
    protected registerRemoteAgent<TOutput extends z.ZodTypeAny>(definition: AgentDefinition<TOutput>): Promise<void>;
    private applyOverrides;
    private registerModelConfigs;
    /**
     * Retrieves an agent definition by name.
     */
    getDefinition(name: string): AgentDefinition | undefined;
    /**
     * Returns all active agent definitions.
     */
    getAllDefinitions(): AgentDefinition[];
    /**
     * Returns a list of all registered agent names.
     */
    getAllAgentNames(): string[];
    /**
     * Generates a description for the delegate_to_agent tool.
     * Unlike getDirectoryContext() which is for system prompts,
     * this is formatted for tool descriptions.
     */
    getToolDescription(): string;
    /**
     * Generates a markdown "Phone Book" of available agents and their schemas.
     * This MUST be injected into the System Prompt of the parent agent.
     */
    getDirectoryContext(): string;
}
