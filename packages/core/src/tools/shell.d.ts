/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { ToolInvocation, ToolResult, ToolCallConfirmationDetails } from './tools.js';
import { BaseDeclarativeTool, BaseToolInvocation, ToolConfirmationOutcome, type PolicyUpdateOptions } from './tools.js';
import type { ShellExecutionConfig } from '../services/shellExecutionService.js';
import type { AnsiOutput } from '../utils/terminalSerializer.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
export declare const OUTPUT_UPDATE_INTERVAL_MS = 1000;
export interface ShellToolParams {
    command: string;
    description?: string;
    dir_path?: string;
}
export declare class ShellToolInvocation extends BaseToolInvocation<ShellToolParams, ToolResult> {
    private readonly config;
    constructor(config: Config, params: ShellToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string);
    getDescription(): string;
    protected getPolicyUpdateOptions(outcome: ToolConfirmationOutcome): PolicyUpdateOptions | undefined;
    protected getConfirmationDetails(_abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    execute(signal: AbortSignal, updateOutput?: (output: string | AnsiOutput) => void, shellExecutionConfig?: ShellExecutionConfig, setPidCallback?: (pid: number) => void): Promise<ToolResult>;
}
export declare class ShellTool extends BaseDeclarativeTool<ShellToolParams, ToolResult> {
    private readonly config;
    static readonly Name = "run_shell_command";
    constructor(config: Config, messageBus: MessageBus);
    protected validateToolParamValues(params: ShellToolParams): string | null;
    protected createInvocation(params: ShellToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<ShellToolParams, ToolResult>;
}
