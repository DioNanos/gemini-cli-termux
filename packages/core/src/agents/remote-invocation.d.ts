/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseToolInvocation, type ToolResult, type ToolCallConfirmationDetails } from '../tools/tools.js';
import type { RemoteAgentInputs, RemoteAgentDefinition, AgentInputs } from './types.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { AuthenticationHandler } from '@a2a-js/sdk/client';
/**
 * Authentication handler implementation using Google Application Default Credentials (ADC).
 */
export declare class ADCHandler implements AuthenticationHandler {
    private auth;
    headers(): Promise<Record<string, string>>;
    shouldRetryWithHeaders(_response: unknown): Promise<Record<string, string> | undefined>;
}
/**
 * A tool invocation that proxies to a remote A2A agent.
 *
 * This implementation bypasses the local `LocalAgentExecutor` loop and directly
 * invokes the configured A2A tool.
 */
export declare class RemoteAgentInvocation extends BaseToolInvocation<RemoteAgentInputs, ToolResult> {
    private readonly definition;
    private static readonly sessionState;
    private contextId;
    private taskId;
    private readonly clientManager;
    private readonly authHandler;
    constructor(definition: RemoteAgentDefinition, params: AgentInputs, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string);
    getDescription(): string;
    protected getConfirmationDetails(_abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    execute(_signal: AbortSignal): Promise<ToolResult>;
}
