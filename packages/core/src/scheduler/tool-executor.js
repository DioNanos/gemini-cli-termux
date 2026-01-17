/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ToolErrorType, ToolOutputTruncatedEvent, logToolOutputTruncated, runInDevTraceSpan, } from '../index.js';
import { SHELL_TOOL_NAME } from '../tools/tool-names.js';
import { ShellToolInvocation } from '../tools/shell.js';
import { executeToolWithHooks } from '../core/coreToolHookTriggers.js';
import { saveTruncatedToolOutput, formatTruncatedToolOutput, } from '../utils/fileUtils.js';
import { convertToFunctionResponse } from '../utils/generateContentResponseUtilities.js';
export class ToolExecutor {
    config;
    constructor(config) {
        this.config = config;
    }
    async execute(context) {
        const { call, signal, outputUpdateHandler, onUpdateToolCall } = context;
        const { request } = call;
        const toolName = request.name;
        const callId = request.callId;
        if (!('tool' in call) || !call.tool || !('invocation' in call)) {
            throw new Error(`Cannot execute tool call ${callId}: Tool or Invocation missing.`);
        }
        const { tool, invocation } = call;
        // Setup live output handling
        const liveOutputCallback = tool.canUpdateOutput && outputUpdateHandler
            ? (outputChunk) => {
                outputUpdateHandler(callId, outputChunk);
            }
            : undefined;
        const shellExecutionConfig = this.config.getShellExecutionConfig();
        const hooksEnabled = this.config.getEnableHooks();
        const messageBus = this.config.getMessageBus();
        return runInDevTraceSpan({
            name: tool.name,
            attributes: { type: 'tool-call' },
        }, async ({ metadata: spanMetadata }) => {
            spanMetadata.input = { request };
            try {
                let promise;
                if (invocation instanceof ShellToolInvocation) {
                    const setPidCallback = (pid) => {
                        const executingCall = {
                            ...call,
                            status: 'executing',
                            tool,
                            invocation,
                            pid,
                            startTime: 'startTime' in call ? call.startTime : undefined,
                        };
                        onUpdateToolCall(executingCall);
                    };
                    promise = executeToolWithHooks(invocation, toolName, signal, messageBus, hooksEnabled, tool, liveOutputCallback, shellExecutionConfig, setPidCallback, this.config);
                }
                else {
                    promise = executeToolWithHooks(invocation, toolName, signal, messageBus, hooksEnabled, tool, liveOutputCallback, shellExecutionConfig, undefined, this.config);
                }
                const toolResult = await promise;
                spanMetadata.output = toolResult;
                if (signal.aborted) {
                    return this.createCancelledResult(call, 'User cancelled tool execution.');
                }
                else if (toolResult.error === undefined) {
                    return await this.createSuccessResult(call, toolResult);
                }
                else {
                    return this.createErrorResult(call, new Error(toolResult.error.message), toolResult.error.type);
                }
            }
            catch (executionError) {
                spanMetadata.error = executionError;
                if (signal.aborted) {
                    return this.createCancelledResult(call, 'User cancelled tool execution.');
                }
                const error = executionError instanceof Error
                    ? executionError
                    : new Error(String(executionError));
                return this.createErrorResult(call, error, ToolErrorType.UNHANDLED_EXCEPTION);
            }
        });
    }
    createCancelledResult(call, reason) {
        const errorMessage = `[Operation Cancelled] ${reason}`;
        const startTime = 'startTime' in call ? call.startTime : undefined;
        if (!('tool' in call) || !('invocation' in call)) {
            // This should effectively never happen in execution phase, but we handle
            // it safely
            throw new Error('Cancelled tool call missing tool/invocation references');
        }
        return {
            status: 'cancelled',
            request: call.request,
            response: {
                callId: call.request.callId,
                responseParts: [
                    {
                        functionResponse: {
                            id: call.request.callId,
                            name: call.request.name,
                            response: { error: errorMessage },
                        },
                    },
                ],
                resultDisplay: undefined,
                error: undefined,
                errorType: undefined,
                contentLength: errorMessage.length,
            },
            tool: call.tool,
            invocation: call.invocation,
            durationMs: startTime ? Date.now() - startTime : undefined,
            outcome: call.outcome,
        };
    }
    async createSuccessResult(call, toolResult) {
        let content = toolResult.llmContent;
        let outputFile;
        const toolName = call.request.name;
        const callId = call.request.callId;
        if (typeof content === 'string' &&
            toolName === SHELL_TOOL_NAME &&
            this.config.getEnableToolOutputTruncation() &&
            this.config.getTruncateToolOutputThreshold() > 0 &&
            this.config.getTruncateToolOutputLines() > 0) {
            const originalContentLength = content.length;
            const threshold = this.config.getTruncateToolOutputThreshold();
            const lines = this.config.getTruncateToolOutputLines();
            if (content.length > threshold) {
                const { outputFile: savedPath } = await saveTruncatedToolOutput(content, toolName, callId, this.config.storage.getProjectTempDir());
                outputFile = savedPath;
                content = formatTruncatedToolOutput(content, outputFile, lines);
                logToolOutputTruncated(this.config, new ToolOutputTruncatedEvent(call.request.prompt_id, {
                    toolName,
                    originalContentLength,
                    truncatedContentLength: content.length,
                    threshold,
                    lines,
                }));
            }
        }
        const response = convertToFunctionResponse(toolName, callId, content, this.config.getActiveModel());
        const successResponse = {
            callId,
            responseParts: response,
            resultDisplay: toolResult.returnDisplay,
            error: undefined,
            errorType: undefined,
            outputFile,
            contentLength: typeof content === 'string' ? content.length : undefined,
        };
        const startTime = 'startTime' in call ? call.startTime : undefined;
        // Ensure we have tool and invocation
        if (!('tool' in call) || !('invocation' in call)) {
            throw new Error('Successful tool call missing tool or invocation');
        }
        return {
            status: 'success',
            request: call.request,
            tool: call.tool,
            response: successResponse,
            invocation: call.invocation,
            durationMs: startTime ? Date.now() - startTime : undefined,
            outcome: call.outcome,
        };
    }
    createErrorResult(call, error, errorType) {
        const response = this.createErrorResponse(call.request, error, errorType);
        const startTime = 'startTime' in call ? call.startTime : undefined;
        return {
            status: 'error',
            request: call.request,
            response,
            tool: call.tool,
            durationMs: startTime ? Date.now() - startTime : undefined,
            outcome: call.outcome,
        };
    }
    createErrorResponse(request, error, errorType) {
        return {
            callId: request.callId,
            error,
            responseParts: [
                {
                    functionResponse: {
                        id: request.callId,
                        name: request.name,
                        response: { error: error.message },
                    },
                },
            ],
            resultDisplay: error.message,
            errorType,
            contentLength: error.message.length,
        };
    }
}
//# sourceMappingURL=tool-executor.js.map