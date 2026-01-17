/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { AnsiOutput } from '../utils/terminalSerializer.js';
import { BaseToolInvocation, type ToolResult } from '../tools/tools.js';
import type { LocalAgentDefinition, AgentInputs } from './types.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
/**
 * Represents a validated, executable instance of a subagent tool.
 *
 * This class orchestrates the execution of a defined agent by:
 * 1. Initializing the {@link LocalAgentExecutor}.
 * 2. Running the agent's execution loop.
 * 3. Bridging the agent's streaming activity (e.g., thoughts) to the tool's
 * live output stream.
 * 4. Formatting the final result into a {@link ToolResult}.
 */
export declare class LocalSubagentInvocation extends BaseToolInvocation<AgentInputs, ToolResult> {
    private readonly definition;
    private readonly config;
    /**
     * @param definition The definition object that configures the agent.
     * @param config The global runtime configuration.
     * @param params The validated input parameters for the agent.
     * @param messageBus Message bus for policy enforcement.
     */
    constructor(definition: LocalAgentDefinition, config: Config, params: AgentInputs, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string);
    /**
     * Returns a concise, human-readable description of the invocation.
     * Used for logging and display purposes.
     */
    getDescription(): string;
    /**
     * Executes the subagent.
     *
     * @param signal An `AbortSignal` to cancel the agent's execution.
     * @param updateOutput A callback to stream intermediate output, such as the
     * agent's thoughts, to the user interface.
     * @returns A `Promise` that resolves with the final `ToolResult`.
     */
    execute(signal: AbortSignal, updateOutput?: (output: string | AnsiOutput) => void): Promise<ToolResult>;
}
