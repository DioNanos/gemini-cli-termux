/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LocalAgentExecutor } from './local-executor.js';
import { BaseToolInvocation } from '../tools/tools.js';
import { ToolErrorType } from '../tools/tool-error.js';
const INPUT_PREVIEW_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 200;
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
export class LocalSubagentInvocation extends BaseToolInvocation {
    definition;
    config;
    /**
     * @param definition The definition object that configures the agent.
     * @param config The global runtime configuration.
     * @param params The validated input parameters for the agent.
     * @param messageBus Message bus for policy enforcement.
     */
    constructor(definition, config, params, messageBus, _toolName, _toolDisplayName) {
        super(params, messageBus, _toolName ?? definition.name, _toolDisplayName ?? definition.displayName);
        this.definition = definition;
        this.config = config;
    }
    /**
     * Returns a concise, human-readable description of the invocation.
     * Used for logging and display purposes.
     */
    getDescription() {
        const inputSummary = Object.entries(this.params)
            .map(([key, value]) => `${key}: ${String(value).slice(0, INPUT_PREVIEW_MAX_LENGTH)}`)
            .join(', ');
        const description = `Running subagent '${this.definition.name}' with inputs: { ${inputSummary} }`;
        return description.slice(0, DESCRIPTION_MAX_LENGTH);
    }
    /**
     * Executes the subagent.
     *
     * @param signal An `AbortSignal` to cancel the agent's execution.
     * @param updateOutput A callback to stream intermediate output, such as the
     * agent's thoughts, to the user interface.
     * @returns A `Promise` that resolves with the final `ToolResult`.
     */
    async execute(signal, updateOutput) {
        try {
            if (updateOutput) {
                updateOutput('Subagent starting...\n');
            }
            // Create an activity callback to bridge the executor's events to the
            // tool's streaming output.
            const onActivity = (activity) => {
                if (!updateOutput)
                    return;
                if (activity.type === 'THOUGHT_CHUNK' &&
                    typeof activity.data['text'] === 'string') {
                    updateOutput(`🤖💭 ${activity.data['text']}`);
                }
            };
            const executor = await LocalAgentExecutor.create(this.definition, this.config, onActivity);
            const output = await executor.run(this.params, signal);
            const resultContent = `Subagent '${this.definition.name}' finished.
Termination Reason: ${output.terminate_reason}
Result:
${output.result}`;
            const displayContent = `
Subagent ${this.definition.name} Finished

Termination Reason:\n ${output.terminate_reason}

Result:
${output.result}
`;
            return {
                llmContent: [{ text: resultContent }],
                returnDisplay: displayContent,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Subagent '${this.definition.name}' failed. Error: ${errorMessage}`,
                returnDisplay: `Subagent Failed: ${this.definition.name}\nError: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}
//# sourceMappingURL=local-invocation.js.map