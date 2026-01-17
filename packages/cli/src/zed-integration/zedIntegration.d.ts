/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config, GeminiChat } from '@google/gemini-cli-core';
import * as acp from '@agentclientprotocol/sdk';
import type { LoadedSettings } from '../config/settings.js';
import type { CliArgs } from '../config/config.js';
export declare function runZedIntegration(config: Config, settings: LoadedSettings, argv: CliArgs): Promise<void>;
export declare class GeminiAgent {
    private config;
    private settings;
    private argv;
    private connection;
    private sessions;
    private clientCapabilities;
    constructor(config: Config, settings: LoadedSettings, argv: CliArgs, connection: acp.AgentSideConnection);
    initialize(args: acp.InitializeRequest): Promise<acp.InitializeResponse>;
    authenticate({ methodId }: acp.AuthenticateRequest): Promise<void>;
    newSession({ cwd, mcpServers, }: acp.NewSessionRequest): Promise<acp.NewSessionResponse>;
    newSessionConfig(sessionId: string, cwd: string, mcpServers: acp.McpServer[]): Promise<Config>;
    cancel(params: acp.CancelNotification): Promise<void>;
    prompt(params: acp.PromptRequest): Promise<acp.PromptResponse>;
}
export declare class Session {
    #private;
    private readonly id;
    private readonly chat;
    private readonly config;
    private readonly connection;
    private pendingPrompt;
    constructor(id: string, chat: GeminiChat, config: Config, connection: acp.AgentSideConnection);
    cancelPendingPrompt(): Promise<void>;
    prompt(params: acp.PromptRequest): Promise<acp.PromptResponse>;
    private sendUpdate;
    private runTool;
    debug(msg: string): void;
}
