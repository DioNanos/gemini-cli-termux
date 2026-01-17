/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ToolCallConfirmationDetails, ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool, BaseToolInvocation, ToolConfirmationOutcome, type PolicyUpdateOptions } from './tools.js';
import type { CallableTool, Part } from '@google/genai';
import type { Config } from '../config/config.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
type ToolParams = Record<string, unknown>;
export declare class DiscoveredMCPToolInvocation extends BaseToolInvocation<ToolParams, ToolResult> {
    private readonly mcpTool;
    readonly serverName: string;
    readonly serverToolName: string;
    readonly displayName: string;
    readonly trust?: boolean | undefined;
    private readonly cliConfig?;
    private static readonly allowlist;
    constructor(mcpTool: CallableTool, serverName: string, serverToolName: string, displayName: string, messageBus: MessageBus, trust?: boolean | undefined, params?: ToolParams, cliConfig?: Config | undefined);
    protected getPolicyUpdateOptions(_outcome: ToolConfirmationOutcome): PolicyUpdateOptions | undefined;
    protected getConfirmationDetails(_abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    isMCPToolError(rawResponseParts: Part[]): boolean;
    execute(signal: AbortSignal): Promise<ToolResult>;
    getDescription(): string;
}
export declare class DiscoveredMCPTool extends BaseDeclarativeTool<ToolParams, ToolResult> {
    private readonly mcpTool;
    readonly serverName: string;
    readonly serverToolName: string;
    readonly parameterSchema: unknown;
    readonly trust?: boolean | undefined;
    private readonly cliConfig?;
    readonly extensionName?: string | undefined;
    readonly extensionId?: string | undefined;
    constructor(mcpTool: CallableTool, serverName: string, serverToolName: string, description: string, parameterSchema: unknown, messageBus: MessageBus, trust?: boolean | undefined, nameOverride?: string, cliConfig?: Config | undefined, extensionName?: string | undefined, extensionId?: string | undefined);
    getFullyQualifiedPrefix(): string;
    asFullyQualifiedTool(): DiscoveredMCPTool;
    protected createInvocation(params: ToolParams, messageBus: MessageBus, _toolName?: string, _displayName?: string): ToolInvocation<ToolParams, ToolResult>;
}
/** Visible for testing */
export declare function generateValidName(name: string): string;
export {};
