/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ClientFactory, ClientFactoryOptions, DefaultAgentCardResolver, RestTransportFactory, JsonRpcTransportFactory, createAuthenticatingFetchWithRetry, } from '@a2a-js/sdk/client';
import { v4 as uuidv4 } from 'uuid';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Manages A2A clients and caches loaded agent information.
 * Follows a singleton pattern to ensure a single client instance.
 */
export class A2AClientManager {
    static instance;
    // Each agent should manage their own context/taskIds/card/etc
    clients = new Map();
    agentCards = new Map();
    constructor() { }
    /**
     * Gets the singleton instance of the A2AClientManager.
     */
    static getInstance() {
        if (!A2AClientManager.instance) {
            A2AClientManager.instance = new A2AClientManager();
        }
        return A2AClientManager.instance;
    }
    /**
     * Resets the singleton instance. Only for testing purposes.
     * @internal
     */
    static resetInstanceForTesting() {
        // @ts-expect-error - Resetting singleton for testing
        A2AClientManager.instance = undefined;
    }
    /**
     * Loads an agent by fetching its AgentCard and caches the client.
     * @param name The name to assign to the agent.
     * @param agentCardUrl The full URL to the agent's card.
     * @param authHandler Optional authentication handler to use for this agent.
     * @returns The loaded AgentCard.
     */
    async loadAgent(name, agentCardUrl, authHandler) {
        if (this.clients.has(name) && this.agentCards.has(name)) {
            throw new Error(`Agent with name '${name}' is already loaded.`);
        }
        let fetchImpl = fetch;
        if (authHandler) {
            fetchImpl = createAuthenticatingFetchWithRetry(fetch, authHandler);
        }
        const resolver = new DefaultAgentCardResolver({ fetchImpl });
        const options = ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
            transports: [
                new RestTransportFactory({ fetchImpl }),
                new JsonRpcTransportFactory({ fetchImpl }),
            ],
            cardResolver: resolver,
        });
        const factory = new ClientFactory(options);
        const client = await factory.createFromUrl(agentCardUrl, '');
        const agentCard = await client.getAgentCard();
        this.clients.set(name, client);
        this.agentCards.set(name, agentCard);
        debugLogger.debug(`[A2AClientManager] Loaded agent '${name}' from ${agentCardUrl}`);
        return agentCard;
    }
    /**
     * Invalidates all cached clients and agent cards.
     */
    clearCache() {
        this.clients.clear();
        this.agentCards.clear();
        debugLogger.debug('[A2AClientManager] Cache cleared.');
    }
    /**
     * Sends a message to a loaded agent.
     * @param agentName The name of the agent to send the message to.
     * @param message The message content.
     * @param options Optional context and task IDs to maintain conversation state.
     * @returns The response from the agent (Message or Task).
     * @throws Error if the agent returns an error response.
     */
    async sendMessage(agentName, message, options) {
        const client = this.clients.get(agentName);
        if (!client) {
            throw new Error(`Agent '${agentName}' not found.`);
        }
        const messageParams = {
            message: {
                kind: 'message',
                role: 'user',
                messageId: uuidv4(),
                parts: [{ kind: 'text', text: message }],
                contextId: options?.contextId,
                taskId: options?.taskId,
            },
            configuration: {
                blocking: true,
            },
        };
        try {
            return await client.sendMessage(messageParams);
        }
        catch (error) {
            const prefix = `A2AClient SendMessage Error [${agentName}]`;
            if (error instanceof Error) {
                throw new Error(`${prefix}: ${error.message}`, { cause: error });
            }
            throw new Error(`${prefix}: Unexpected error during sendMessage: ${String(error)}`);
        }
    }
    /**
     * Retrieves a loaded agent card.
     * @param name The name of the agent.
     * @returns The agent card, or undefined if not found.
     */
    getAgentCard(name) {
        return this.agentCards.get(name);
    }
    /**
     * Retrieves a loaded client.
     * @param name The name of the agent.
     * @returns The client, or undefined if not found.
     */
    getClient(name) {
        return this.clients.get(name);
    }
    /**
     * Retrieves a task from an agent.
     * @param agentName The name of the agent.
     * @param taskId The ID of the task to retrieve.
     * @returns The task details.
     */
    async getTask(agentName, taskId) {
        const client = this.clients.get(agentName);
        if (!client) {
            throw new Error(`Agent '${agentName}' not found.`);
        }
        try {
            return await client.getTask({ id: taskId });
        }
        catch (error) {
            const prefix = `A2AClient getTask Error [${agentName}]`;
            if (error instanceof Error) {
                throw new Error(`${prefix}: ${error.message}`, { cause: error });
            }
            throw new Error(`${prefix}: Unexpected error: ${String(error)}`);
        }
    }
    /**
     * Cancels a task on an agent.
     * @param agentName The name of the agent.
     * @param taskId The ID of the task to cancel.
     * @returns The cancellation response.
     */
    async cancelTask(agentName, taskId) {
        const client = this.clients.get(agentName);
        if (!client) {
            throw new Error(`Agent '${agentName}' not found.`);
        }
        try {
            return await client.cancelTask({ id: taskId });
        }
        catch (error) {
            const prefix = `A2AClient cancelTask Error [${agentName}]`;
            if (error instanceof Error) {
                throw new Error(`${prefix}: ${error.message}`, { cause: error });
            }
            throw new Error(`${prefix}: Unexpected error: ${String(error)}`);
        }
    }
}
//# sourceMappingURL=a2a-client-manager.js.map