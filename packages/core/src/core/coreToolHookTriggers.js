/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MessageBusType, } from '../confirmation-bus/types.js';
import { createHookOutput, NotificationType, BeforeToolHookOutput, } from '../hooks/types.js';
import { ToolErrorType } from '../tools/tool-error.js';
import { debugLogger } from '../utils/debugLogger.js';
import { ShellToolInvocation } from '../tools/shell.js';
import { DiscoveredMCPToolInvocation } from '../tools/mcp-tool.js';
/**
 * Converts ToolCallConfirmationDetails to a serializable format for hooks.
 * Excludes function properties (onConfirm, ideConfirmation) that can't be serialized.
 */
function toSerializableDetails(details) {
    const base = {
        type: details.type,
        title: details.title,
    };
    switch (details.type) {
        case 'edit':
            return {
                ...base,
                fileName: details.fileName,
                filePath: details.filePath,
                fileDiff: details.fileDiff,
                originalContent: details.originalContent,
                newContent: details.newContent,
                isModifying: details.isModifying,
            };
        case 'exec':
            return {
                ...base,
                command: details.command,
                rootCommand: details.rootCommand,
            };
        case 'mcp':
            return {
                ...base,
                serverName: details.serverName,
                toolName: details.toolName,
                toolDisplayName: details.toolDisplayName,
            };
        case 'info':
            return {
                ...base,
                prompt: details.prompt,
                urls: details.urls,
            };
        default:
            return base;
    }
}
/**
 * Gets the message to display in the notification hook for tool confirmation.
 */
function getNotificationMessage(confirmationDetails) {
    switch (confirmationDetails.type) {
        case 'edit':
            return `Tool ${confirmationDetails.title} requires editing`;
        case 'exec':
            return `Tool ${confirmationDetails.title} requires execution`;
        case 'mcp':
            return `Tool ${confirmationDetails.title} requires MCP`;
        case 'info':
            return `Tool ${confirmationDetails.title} requires information`;
        default:
            return `Tool requires confirmation`;
    }
}
/**
 * Fires the ToolPermission notification hook for a tool that needs confirmation.
 *
 * @param messageBus The message bus to use for hook communication
 * @param confirmationDetails The tool confirmation details
 */
export async function fireToolNotificationHook(messageBus, confirmationDetails) {
    try {
        const message = getNotificationMessage(confirmationDetails);
        const serializedDetails = toSerializableDetails(confirmationDetails);
        await messageBus.request({
            type: MessageBusType.HOOK_EXECUTION_REQUEST,
            eventName: 'Notification',
            input: {
                notification_type: NotificationType.ToolPermission,
                message,
                details: serializedDetails,
            },
        }, MessageBusType.HOOK_EXECUTION_RESPONSE);
    }
    catch (error) {
        debugLogger.debug(`Notification hook failed for ${confirmationDetails.title}:`, error);
    }
}
/**
 * Extracts MCP context from a tool invocation if it's an MCP tool.
 *
 * @param invocation The tool invocation
 * @param config Config to look up server details
 * @returns MCP context if this is an MCP tool, undefined otherwise
 */
function extractMcpContext(invocation, config) {
    if (!(invocation instanceof DiscoveredMCPToolInvocation)) {
        return undefined;
    }
    // Get the server config
    const mcpServers = config.getMcpClientManager()?.getMcpServers() ??
        config.getMcpServers() ??
        {};
    const serverConfig = mcpServers[invocation.serverName];
    if (!serverConfig) {
        return undefined;
    }
    return {
        server_name: invocation.serverName,
        tool_name: invocation.serverToolName,
        // Non-sensitive connection details only
        command: serverConfig.command,
        args: serverConfig.args,
        cwd: serverConfig.cwd,
        url: serverConfig.url ?? serverConfig.httpUrl,
        tcp: serverConfig.tcp,
    };
}
/**
 * Fires the BeforeTool hook and returns the hook output.
 *
 * @param messageBus The message bus to use for hook communication
 * @param toolName The name of the tool being executed
 * @param toolInput The input parameters for the tool
 * @param mcpContext Optional MCP context for MCP tools
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export async function fireBeforeToolHook(messageBus, toolName, toolInput, mcpContext) {
    try {
        const response = await messageBus.request({
            type: MessageBusType.HOOK_EXECUTION_REQUEST,
            eventName: 'BeforeTool',
            input: {
                tool_name: toolName,
                tool_input: toolInput,
                ...(mcpContext && { mcp_context: mcpContext }),
            },
        }, MessageBusType.HOOK_EXECUTION_RESPONSE);
        return response.output
            ? createHookOutput('BeforeTool', response.output)
            : undefined;
    }
    catch (error) {
        debugLogger.debug(`BeforeTool hook failed for ${toolName}:`, error);
        return undefined;
    }
}
/**
 * Fires the AfterTool hook and returns the hook output.
 *
 * @param messageBus The message bus to use for hook communication
 * @param toolName The name of the tool that was executed
 * @param toolInput The input parameters for the tool
 * @param toolResponse The result from the tool execution
 * @param mcpContext Optional MCP context for MCP tools
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export async function fireAfterToolHook(messageBus, toolName, toolInput, toolResponse, mcpContext) {
    try {
        const response = await messageBus.request({
            type: MessageBusType.HOOK_EXECUTION_REQUEST,
            eventName: 'AfterTool',
            input: {
                tool_name: toolName,
                tool_input: toolInput,
                tool_response: toolResponse,
                ...(mcpContext && { mcp_context: mcpContext }),
            },
        }, MessageBusType.HOOK_EXECUTION_RESPONSE);
        return response.output
            ? createHookOutput('AfterTool', response.output)
            : undefined;
    }
    catch (error) {
        debugLogger.debug(`AfterTool hook failed for ${toolName}:`, error);
        return undefined;
    }
}
/**
 * Execute a tool with BeforeTool and AfterTool hooks.
 *
 * @param invocation The tool invocation to execute
 * @param toolName The name of the tool
 * @param signal Abort signal for cancellation
 * @param messageBus Optional message bus for hook communication
 * @param hooksEnabled Whether hooks are enabled
 * @param liveOutputCallback Optional callback for live output updates
 * @param shellExecutionConfig Optional shell execution config
 * @param setPidCallback Optional callback to set the PID for shell invocations
 * @param config Config to look up MCP server details for hook context
 * @returns The tool result
 */
export async function executeToolWithHooks(invocation, toolName, signal, messageBus, hooksEnabled, tool, liveOutputCallback, shellExecutionConfig, setPidCallback, config) {
    const toolInput = (invocation.params || {});
    let inputWasModified = false;
    let modifiedKeys = [];
    // Extract MCP context if this is an MCP tool (only if config is provided)
    const mcpContext = config ? extractMcpContext(invocation, config) : undefined;
    // Fire BeforeTool hook through MessageBus (only if hooks are enabled)
    if (hooksEnabled && messageBus) {
        const beforeOutput = await fireBeforeToolHook(messageBus, toolName, toolInput, mcpContext);
        // Check if hook requested to stop entire agent execution
        if (beforeOutput?.shouldStopExecution()) {
            const reason = beforeOutput.getEffectiveReason();
            return {
                llmContent: `Agent execution stopped by hook: ${reason}`,
                returnDisplay: `Agent execution stopped by hook: ${reason}`,
                error: {
                    type: ToolErrorType.STOP_EXECUTION,
                    message: reason,
                },
            };
        }
        // Check if hook blocked the tool execution
        const blockingError = beforeOutput?.getBlockingError();
        if (blockingError?.blocked) {
            return {
                llmContent: `Tool execution blocked: ${blockingError.reason}`,
                returnDisplay: `Tool execution blocked: ${blockingError.reason}`,
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: blockingError.reason,
                },
            };
        }
        // Check if hook requested to update tool input
        if (beforeOutput instanceof BeforeToolHookOutput) {
            const modifiedInput = beforeOutput.getModifiedToolInput();
            if (modifiedInput) {
                // We modify the toolInput object in-place, which should be the same reference as invocation.params
                // We use Object.assign to update properties
                Object.assign(invocation.params, modifiedInput);
                debugLogger.debug(`Tool input modified by hook for ${toolName}`);
                inputWasModified = true;
                modifiedKeys = Object.keys(modifiedInput);
                // Recreate the invocation with the new parameters
                // to ensure any derived state (like resolvedPath in ReadFileTool) is updated.
                try {
                    // We use the tool's build method to validate and create the invocation
                    // This ensures consistent behavior with the initial creation
                    invocation = tool.build(invocation.params);
                }
                catch (error) {
                    return {
                        llmContent: `Tool parameter modification by hook failed validation: ${error instanceof Error ? error.message : String(error)}`,
                        returnDisplay: `Tool parameter modification by hook failed validation.`,
                        error: {
                            type: ToolErrorType.INVALID_TOOL_PARAMS,
                            message: String(error),
                        },
                    };
                }
            }
        }
    }
    // Execute the actual tool
    let toolResult;
    if (setPidCallback && invocation instanceof ShellToolInvocation) {
        toolResult = await invocation.execute(signal, liveOutputCallback, shellExecutionConfig, setPidCallback);
    }
    else {
        toolResult = await invocation.execute(signal, liveOutputCallback, shellExecutionConfig);
    }
    // Append notification if parameters were modified
    if (inputWasModified) {
        const modificationMsg = `\n\n[System] Tool input parameters (${modifiedKeys.join(', ')}) were modified by a hook before execution.`;
        if (typeof toolResult.llmContent === 'string') {
            toolResult.llmContent += modificationMsg;
        }
        else if (Array.isArray(toolResult.llmContent)) {
            toolResult.llmContent.push({ text: modificationMsg });
        }
        else if (toolResult.llmContent) {
            // Handle single Part case by converting to an array
            toolResult.llmContent = [
                toolResult.llmContent,
                { text: modificationMsg },
            ];
        }
    }
    // Fire AfterTool hook through MessageBus (only if hooks are enabled)
    if (hooksEnabled && messageBus) {
        const afterOutput = await fireAfterToolHook(messageBus, toolName, toolInput, {
            llmContent: toolResult.llmContent,
            returnDisplay: toolResult.returnDisplay,
            error: toolResult.error,
        }, mcpContext);
        // Check if hook requested to stop entire agent execution
        if (afterOutput?.shouldStopExecution()) {
            const reason = afterOutput.getEffectiveReason();
            return {
                llmContent: `Agent execution stopped by hook: ${reason}`,
                returnDisplay: `Agent execution stopped by hook: ${reason}`,
                error: {
                    type: ToolErrorType.STOP_EXECUTION,
                    message: reason,
                },
            };
        }
        // Check if hook blocked the tool result
        const blockingError = afterOutput?.getBlockingError();
        if (blockingError?.blocked) {
            return {
                llmContent: `Tool result blocked: ${blockingError.reason}`,
                returnDisplay: `Tool result blocked: ${blockingError.reason}`,
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: blockingError.reason,
                },
            };
        }
        // Add additional context from hooks to the tool result
        const additionalContext = afterOutput?.getAdditionalContext();
        if (additionalContext) {
            if (typeof toolResult.llmContent === 'string') {
                toolResult.llmContent += '\n\n' + additionalContext;
            }
            else if (Array.isArray(toolResult.llmContent)) {
                toolResult.llmContent.push({ text: '\n\n' + additionalContext });
            }
            else if (toolResult.llmContent) {
                // Handle single Part case by converting to an array
                toolResult.llmContent = [
                    toolResult.llmContent,
                    { text: '\n\n' + additionalContext },
                ];
            }
            else {
                toolResult.llmContent = additionalContext;
            }
        }
    }
    return toolResult;
}
//# sourceMappingURL=coreToolHookTriggers.js.map