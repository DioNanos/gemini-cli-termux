/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from '../tools/tools.js';
import type { AgentRegistry } from './registry.js';
import type { Config } from '../config/config.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
type DelegateParams = {
    agent_name: string;
} & Record<string, unknown>;
export declare class DelegateToAgentTool extends BaseDeclarativeTool<DelegateParams, ToolResult> {
    private readonly registry;
    private readonly config;
    constructor(registry: AgentRegistry, config: Config, messageBus: MessageBus);
    protected createInvocation(params: DelegateParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<DelegateParams, ToolResult>;
}
export {};
