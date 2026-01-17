/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from '../tools/tools.js';
import type { Config } from '../config/config.js';
import type { AgentDefinition, AgentInputs } from './types.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
/**
 * A tool wrapper that dynamically exposes a subagent as a standard,
 * strongly-typed `DeclarativeTool`.
 */
export declare class SubagentToolWrapper extends BaseDeclarativeTool<AgentInputs, ToolResult> {
    private readonly definition;
    private readonly config;
    /**
     * Constructs the tool wrapper.
     *
     * The constructor dynamically generates the JSON schema for the tool's
     * parameters based on the subagent's input configuration.
     *
     * @param definition The `AgentDefinition` of the subagent to wrap.
     * @param config The runtime configuration, passed down to the subagent.
     * @param messageBus Optional message bus for policy enforcement.
     */
    constructor(definition: AgentDefinition, config: Config, messageBus: MessageBus);
    /**
     * Creates an invocation instance for executing the subagent.
     *
     * This method is called by the tool framework when the parent agent decides
     * to use this tool.
     *
     * @param params The validated input parameters from the parent agent's call.
     * @returns A `ToolInvocation` instance ready for execution.
     */
    protected createInvocation(params: AgentInputs, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<AgentInputs, ToolResult>;
}
