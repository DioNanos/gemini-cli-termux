/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const resourceKey = (serverName, uri) => `${serverName}::${uri}`;
/**
 * Tracks resources discovered from MCP servers so other
 * components can query or include them in conversations.
 */
export class ResourceRegistry {
    resources = new Map();
    /**
     * Replace the resources for a specific server.
     */
    setResourcesForServer(serverName, resources) {
        this.removeResourcesByServer(serverName);
        const discoveredAt = Date.now();
        for (const resource of resources) {
            if (!resource.uri) {
                continue;
            }
            this.resources.set(resourceKey(serverName, resource.uri), {
                serverName,
                discoveredAt,
                ...resource,
            });
        }
    }
    getAllResources() {
        return Array.from(this.resources.values());
    }
    /**
     * Find a resource by its identifier.
     * Format: serverName:uri (e.g., "myserver:file:///data.txt")
     */
    findResourceByUri(identifier) {
        const colonIndex = identifier.indexOf(':');
        if (colonIndex <= 0) {
            return undefined;
        }
        const serverName = identifier.substring(0, colonIndex);
        const uri = identifier.substring(colonIndex + 1);
        return this.resources.get(resourceKey(serverName, uri));
    }
    removeResourcesByServer(serverName) {
        for (const key of Array.from(this.resources.keys())) {
            if (key.startsWith(`${serverName}::`)) {
                this.resources.delete(key);
            }
        }
    }
    clear() {
        this.resources.clear();
    }
}
//# sourceMappingURL=resource-registry.js.map