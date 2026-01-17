/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
export interface MCPResource extends Resource {
    serverName: string;
    discoveredAt: number;
}
export type DiscoveredMCPResource = MCPResource;
/**
 * Tracks resources discovered from MCP servers so other
 * components can query or include them in conversations.
 */
export declare class ResourceRegistry {
    private resources;
    /**
     * Replace the resources for a specific server.
     */
    setResourcesForServer(serverName: string, resources: Resource[]): void;
    getAllResources(): MCPResource[];
    /**
     * Find a resource by its identifier.
     * Format: serverName:uri (e.g., "myserver:file:///data.txt")
     */
    findResourceByUri(identifier: string): MCPResource | undefined;
    removeResourcesByServer(serverName: string): void;
    clear(): void;
}
