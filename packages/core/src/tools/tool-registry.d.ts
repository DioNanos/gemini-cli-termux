/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { FunctionDeclaration } from '@google/genai';
import type { AnyDeclarativeTool, ToolResult, ToolInvocation } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import type { Config } from '../config/config.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
type ToolParams = Record<string, unknown>;
export declare class DiscoveredTool extends BaseDeclarativeTool<ToolParams, ToolResult> {
    private readonly config;
    readonly parameterSchema: Record<string, unknown>;
    private readonly originalName;
    constructor(config: Config, originalName: string, prefixedName: string, description: string, parameterSchema: Record<string, unknown>, messageBus: MessageBus);
    protected createInvocation(params: ToolParams, messageBus: MessageBus, _toolName?: string, _displayName?: string): ToolInvocation<ToolParams, ToolResult>;
}
export declare class ToolRegistry {
    private allKnownTools;
    private config;
    private messageBus;
    constructor(config: Config, messageBus: MessageBus);
    getMessageBus(): MessageBus;
    /**
     * Registers a tool definition.
     *
     * Note that excluded tools are still registered to allow for enabling them
     * later in the session.
     *
     * @param tool - The tool object containing schema and execution logic.
     */
    registerTool(tool: AnyDeclarativeTool): void;
    /**
     * Unregisters a tool definition by name.
     *
     * @param name - The name of the tool to unregister.
     */
    unregisterTool(name: string): void;
    /**
     * Sorts tools as:
     * 1. Built in tools.
     * 2. Discovered tools.
     * 3. MCP tools ordered by server name.
     *
     * This is a stable sort in that tries preserve existing order.
     */
    sortTools(): void;
    private removeDiscoveredTools;
    /**
     * Removes all tools from a specific MCP server.
     * @param serverName The name of the server to remove tools from.
     */
    removeMcpToolsByServer(serverName: string): void;
    /**
     * Discovers tools from project (if available and configured).
     * Can be called multiple times to update discovered tools.
     * This will discover tools from the command line and from MCP servers.
     */
    discoverAllTools(): Promise<void>;
    private discoverAndRegisterToolsFromCommand;
    /**
     * @returns All the tools that are not excluded.
     */
    private getActiveTools;
    /**
     * @param tool
     * @param excludeTools (optional, helps performance for repeated calls)
     * @returns Whether or not the `tool` is not excluded.
     */
    private isActiveTool;
    /**
     * Retrieves the list of tool schemas (FunctionDeclaration array).
     * Extracts the declarations from the ToolListUnion structure.
     * Includes discovered (vs registered) tools if configured.
     * @returns An array of FunctionDeclarations.
     */
    getFunctionDeclarations(): FunctionDeclaration[];
    /**
     * Retrieves a filtered list of tool schemas based on a list of tool names.
     * @param toolNames - An array of tool names to include.
     * @returns An array of FunctionDeclarations for the specified tools.
     */
    getFunctionDeclarationsFiltered(toolNames: string[]): FunctionDeclaration[];
    /**
     * Returns an array of all registered and discovered tool names which are not
     * excluded via configuration.
     */
    getAllToolNames(): string[];
    /**
     * Returns an array of all registered and discovered tool instances.
     */
    getAllTools(): AnyDeclarativeTool[];
    /**
     * Returns an array of tools registered from a specific MCP server.
     */
    getToolsByServer(serverName: string): AnyDeclarativeTool[];
    /**
     * Get the definition of a specific tool.
     */
    getTool(name: string): AnyDeclarativeTool | undefined;
}
export {};
