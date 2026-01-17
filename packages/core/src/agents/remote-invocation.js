/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseToolInvocation, } from '../tools/tools.js';
import { A2AClientManager } from './a2a-client-manager.js';
import { extractMessageText, extractTaskText, extractIdsFromResponse, } from './a2aUtils.js';
import { GoogleAuth } from 'google-auth-library';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Authentication handler implementation using Google Application Default Credentials (ADC).
 */
export class ADCHandler {
    auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    async headers() {
        try {
            const client = await this.auth.getClient();
            const token = await client.getAccessToken();
            if (token.token) {
                return { Authorization: `Bearer ${token.token}` };
            }
            throw new Error('Failed to retrieve ADC access token.');
        }
        catch (e) {
            const errorMessage = `Failed to get ADC token: ${e instanceof Error ? e.message : String(e)}`;
            debugLogger.log('ERROR', errorMessage);
            throw new Error(errorMessage);
        }
    }
    async shouldRetryWithHeaders(_response) {
        // For ADC, we usually just re-fetch the token if needed.
        return this.headers();
    }
}
/**
 * A tool invocation that proxies to a remote A2A agent.
 *
 * This implementation bypasses the local `LocalAgentExecutor` loop and directly
 * invokes the configured A2A tool.
 */
export class RemoteAgentInvocation extends BaseToolInvocation {
    definition;
    // Persist state across ephemeral invocation instances.
    static sessionState = new Map();
    // State for the ongoing conversation with the remote agent
    contextId;
    taskId;
    // TODO: See if we can reuse the singleton from AppContainer or similar, but for now use getInstance directly
    // as per the current pattern in the codebase.
    clientManager = A2AClientManager.getInstance();
    authHandler = new ADCHandler();
    constructor(definition, params, messageBus, _toolName, _toolDisplayName) {
        const query = params['query'];
        if (typeof query !== 'string') {
            throw new Error(`Remote agent '${definition.name}' requires a string 'query' input.`);
        }
        // Safe to pass strict object to super
        super({ query }, messageBus, _toolName ?? definition.name, _toolDisplayName ?? definition.displayName);
        this.definition = definition;
    }
    getDescription() {
        return `Calling remote agent ${this.definition.displayName ?? this.definition.name}`;
    }
    async getConfirmationDetails(_abortSignal) {
        // For now, always require confirmation for remote agents until we have a policy system for them.
        return {
            type: 'info',
            title: `Call Remote Agent: ${this.definition.displayName ?? this.definition.name}`,
            prompt: `Calling remote agent: "${this.params.query}"`,
            onConfirm: async (outcome) => {
                await this.publishPolicyUpdate(outcome);
            },
        };
    }
    async execute(_signal) {
        // 1. Ensure the agent is loaded (cached by manager)
        // We assume the user has provided an access token via some mechanism (TODO),
        // or we rely on ADC.
        try {
            const priorState = RemoteAgentInvocation.sessionState.get(this.definition.name);
            if (priorState) {
                this.contextId = priorState.contextId;
                this.taskId = priorState.taskId;
            }
            if (!this.clientManager.getClient(this.definition.name)) {
                await this.clientManager.loadAgent(this.definition.name, this.definition.agentCardUrl, this.authHandler);
            }
            const message = this.params.query;
            const response = await this.clientManager.sendMessage(this.definition.name, message, {
                contextId: this.contextId,
                taskId: this.taskId,
            });
            // Extracts IDs, taskID will be undefined if the task is completed/failed/canceled.
            const { contextId, taskId } = extractIdsFromResponse(response);
            this.contextId = contextId ?? this.contextId;
            this.taskId = taskId;
            RemoteAgentInvocation.sessionState.set(this.definition.name, {
                contextId: this.contextId,
                taskId: this.taskId,
            });
            // Extract the output text
            const outputText = response.kind === 'task'
                ? extractTaskText(response)
                : response.kind === 'message'
                    ? extractMessageText(response)
                    : JSON.stringify(response);
            debugLogger.debug(`[RemoteAgent] Response from ${this.definition.name}:\n${JSON.stringify(response, null, 2)}`);
            return {
                llmContent: [{ text: outputText }],
                returnDisplay: outputText,
            };
        }
        catch (error) {
            const errorMessage = `Error calling remote agent: ${error instanceof Error ? error.message : String(error)}`;
            return {
                llmContent: [{ text: errorMessage }],
                returnDisplay: errorMessage,
                error: { message: errorMessage },
            };
        }
    }
}
//# sourceMappingURL=remote-invocation.js.map