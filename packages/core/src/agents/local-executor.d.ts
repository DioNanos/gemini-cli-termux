/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { LocalAgentDefinition, AgentInputs, OutputObject, SubagentActivityEvent } from './types.js';
import { type z } from 'zod';
/** A callback function to report on agent activity. */
export type ActivityCallback = (activity: SubagentActivityEvent) => void;
export declare function createUnauthorizedToolError(toolName: string): string;
/**
 * Executes an agent loop based on an {@link AgentDefinition}.
 *
 * This executor runs the agent in a loop, calling tools until it calls the
 * mandatory `complete_task` tool to signal completion.
 */
export declare class LocalAgentExecutor<TOutput extends z.ZodTypeAny> {
    readonly definition: LocalAgentDefinition<TOutput>;
    private readonly agentId;
    private readonly toolRegistry;
    private readonly runtimeContext;
    private readonly onActivity?;
    private readonly compressionService;
    private hasFailedCompressionAttempt;
    /**
     * Creates and validates a new `AgentExecutor` instance.
     *
     * This method ensures that all tools specified in the agent's definition are
     * safe for non-interactive use before creating the executor.
     *
     * @param definition The definition object for the agent.
     * @param runtimeContext The global runtime configuration.
     * @param onActivity An optional callback to receive activity events.
     * @returns A promise that resolves to a new `LocalAgentExecutor` instance.
     */
    static create<TOutput extends z.ZodTypeAny>(definition: LocalAgentDefinition<TOutput>, runtimeContext: Config, onActivity?: ActivityCallback): Promise<LocalAgentExecutor<TOutput>>;
    /**
     * Constructs a new AgentExecutor instance.
     *
     * @private This constructor is private. Use the static `create` method to
     * instantiate the class.
     */
    private constructor();
    /**
     * Executes a single turn of the agent's logic, from calling the model
     * to processing its response.
     *
     * @returns An {@link AgentTurnResult} object indicating whether to continue
     * or stop the agent loop.
     */
    private executeTurn;
    /**
     * Generates a specific warning message for the agent's final turn.
     */
    private getFinalWarningMessage;
    /**
     * Attempts a single, final recovery turn if the agent stops for a recoverable reason.
     * Gives the agent a grace period to call `complete_task`.
     *
     * @returns The final result string if recovery was successful, or `null` if it failed.
     */
    private executeFinalWarningTurn;
    /**
     * Runs the agent.
     *
     * @param inputs The validated input parameters for this invocation.
     * @param signal An `AbortSignal` for cancellation.
     * @returns A promise that resolves to the agent's final output.
     */
    run(inputs: AgentInputs, signal: AbortSignal): Promise<OutputObject>;
    private tryCompressChat;
    /**
     * Calls the generative model with the current context and tools.
     *
     * @returns The model's response, including any tool calls or text.
     */
    private callModel;
    /** Initializes a `GeminiChat` instance for the agent run. */
    private createChatObject;
    /**
     * Executes function calls requested by the model and returns the results.
     *
     * @returns A new `Content` object for history, any submitted output, and completion status.
     */
    private processFunctionCalls;
    /**
     * Prepares the list of tool function declarations to be sent to the model.
     */
    private prepareToolsList;
    /** Builds the system prompt from the agent definition and inputs. */
    private buildSystemPrompt;
    /**
     * Applies template strings to initial messages.
     *
     * @param initialMessages The initial messages from the prompt config.
     * @param inputs The validated input parameters for this invocation.
     * @returns A new array of `Content` with templated strings.
     */
    private applyTemplateToInitialMessages;
    /**
     * Checks if the agent should terminate due to exceeding configured limits.
     *
     * @returns The reason for termination, or `null` if execution can continue.
     */
    private checkTermination;
    /** Emits an activity event to the configured callback. */
    private emitActivity;
}
