/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { type DefaultHookOutput, type McpToolContext } from '../hooks/types.js';
import type { Config } from '../config/config.js';
import type { ToolCallConfirmationDetails, ToolResult, AnyDeclarativeTool } from '../tools/tools.js';
import type { AnsiOutput, ShellExecutionConfig } from '../index.js';
import type { AnyToolInvocation } from '../tools/tools.js';
import { ShellToolInvocation } from '../tools/shell.js';
/**
 * Fires the ToolPermission notification hook for a tool that needs confirmation.
 *
 * @param messageBus The message bus to use for hook communication
 * @param confirmationDetails The tool confirmation details
 */
export declare function fireToolNotificationHook(messageBus: MessageBus, confirmationDetails: ToolCallConfirmationDetails): Promise<void>;
/**
 * Fires the BeforeTool hook and returns the hook output.
 *
 * @param messageBus The message bus to use for hook communication
 * @param toolName The name of the tool being executed
 * @param toolInput The input parameters for the tool
 * @param mcpContext Optional MCP context for MCP tools
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export declare function fireBeforeToolHook(messageBus: MessageBus, toolName: string, toolInput: Record<string, unknown>, mcpContext?: McpToolContext): Promise<DefaultHookOutput | undefined>;
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
export declare function fireAfterToolHook(messageBus: MessageBus, toolName: string, toolInput: Record<string, unknown>, toolResponse: {
    llmContent: ToolResult['llmContent'];
    returnDisplay: ToolResult['returnDisplay'];
    error: ToolResult['error'];
}, mcpContext?: McpToolContext): Promise<DefaultHookOutput | undefined>;
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
export declare function executeToolWithHooks(invocation: ShellToolInvocation | AnyToolInvocation, toolName: string, signal: AbortSignal, messageBus: MessageBus | undefined, hooksEnabled: boolean, tool: AnyDeclarativeTool, liveOutputCallback?: (outputChunk: string | AnsiOutput) => void, shellExecutionConfig?: ShellExecutionConfig, setPidCallback?: (pid: number) => void, config?: Config): Promise<ToolResult>;
