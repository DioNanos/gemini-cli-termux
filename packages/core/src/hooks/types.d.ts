/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentResponse, GenerateContentParameters, ToolConfig as GenAIToolConfig, ToolListUnion } from '@google/genai';
import type { LLMRequest, LLMResponse, HookToolConfig } from './hookTranslator.js';
/**
 * Configuration source levels in precedence order (highest to lowest)
 */
export declare enum ConfigSource {
    Project = "project",
    User = "user",
    System = "system",
    Extensions = "extensions"
}
/**
 * Event names for the hook system
 */
export declare enum HookEventName {
    BeforeTool = "BeforeTool",
    AfterTool = "AfterTool",
    BeforeAgent = "BeforeAgent",
    Notification = "Notification",
    AfterAgent = "AfterAgent",
    SessionStart = "SessionStart",
    SessionEnd = "SessionEnd",
    PreCompress = "PreCompress",
    BeforeModel = "BeforeModel",
    AfterModel = "AfterModel",
    BeforeToolSelection = "BeforeToolSelection"
}
/**
 * Fields in the hooks configuration that are not hook event names
 */
export declare const HOOKS_CONFIG_FIELDS: string[];
/**
 * Hook configuration entry
 */
export interface CommandHookConfig {
    type: HookType.Command;
    command: string;
    name?: string;
    description?: string;
    timeout?: number;
    source?: ConfigSource;
}
export type HookConfig = CommandHookConfig;
/**
 * Hook definition with matcher
 */
export interface HookDefinition {
    matcher?: string;
    sequential?: boolean;
    hooks: HookConfig[];
}
/**
 * Hook implementation types
 */
export declare enum HookType {
    Command = "command"
}
/**
 * Generate a unique key for a hook configuration
 */
export declare function getHookKey(hook: HookConfig): string;
/**
 * Decision types for hook outputs
 */
export type HookDecision = 'ask' | 'block' | 'deny' | 'approve' | 'allow' | undefined;
/**
 * Base hook input - common fields for all events
 */
export interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    hook_event_name: string;
    timestamp: string;
}
/**
 * Base hook output - common fields for all events
 */
export interface HookOutput {
    continue?: boolean;
    stopReason?: string;
    suppressOutput?: boolean;
    systemMessage?: string;
    decision?: HookDecision;
    reason?: string;
    hookSpecificOutput?: Record<string, unknown>;
}
/**
 * Factory function to create the appropriate hook output class based on event name
 * Returns DefaultHookOutput for all events since it contains all necessary methods
 */
export declare function createHookOutput(eventName: string, data: Partial<HookOutput>): DefaultHookOutput;
/**
 * Default implementation of HookOutput with utility methods
 */
export declare class DefaultHookOutput implements HookOutput {
    continue?: boolean;
    stopReason?: string;
    suppressOutput?: boolean;
    systemMessage?: string;
    decision?: HookDecision;
    reason?: string;
    hookSpecificOutput?: Record<string, unknown>;
    constructor(data?: Partial<HookOutput>);
    /**
     * Check if this output represents a blocking decision
     */
    isBlockingDecision(): boolean;
    /**
     * Check if this output requests to stop execution
     */
    shouldStopExecution(): boolean;
    /**
     * Get the effective reason for blocking or stopping
     */
    getEffectiveReason(): string;
    /**
     * Apply LLM request modifications (specific method for BeforeModel hooks)
     */
    applyLLMRequestModifications(target: GenerateContentParameters): GenerateContentParameters;
    /**
     * Apply tool config modifications (specific method for BeforeToolSelection hooks)
     */
    applyToolConfigModifications(target: {
        toolConfig?: GenAIToolConfig;
        tools?: ToolListUnion;
    }): {
        toolConfig?: GenAIToolConfig;
        tools?: ToolListUnion;
    };
    /**
     * Get additional context for adding to responses
     */
    getAdditionalContext(): string | undefined;
    /**
     * Check if execution should be blocked and return error info
     */
    getBlockingError(): {
        blocked: boolean;
        reason: string;
    };
}
/**
 * Specific hook output class for BeforeTool events.
 */
export declare class BeforeToolHookOutput extends DefaultHookOutput {
    /**
     * Get modified tool input if provided by hook
     */
    getModifiedToolInput(): Record<string, unknown> | undefined;
}
/**
 * Specific hook output class for BeforeModel events
 */
export declare class BeforeModelHookOutput extends DefaultHookOutput {
    /**
     * Get synthetic LLM response if provided by hook
     */
    getSyntheticResponse(): GenerateContentResponse | undefined;
    /**
     * Apply modifications to LLM request
     */
    applyLLMRequestModifications(target: GenerateContentParameters): GenerateContentParameters;
}
/**
 * Specific hook output class for BeforeToolSelection events
 */
export declare class BeforeToolSelectionHookOutput extends DefaultHookOutput {
    /**
     * Apply tool configuration modifications
     */
    applyToolConfigModifications(target: {
        toolConfig?: GenAIToolConfig;
        tools?: ToolListUnion;
    }): {
        toolConfig?: GenAIToolConfig;
        tools?: ToolListUnion;
    };
}
/**
 * Specific hook output class for AfterModel events
 */
export declare class AfterModelHookOutput extends DefaultHookOutput {
    /**
     * Get modified LLM response if provided by hook
     */
    getModifiedResponse(): GenerateContentResponse | undefined;
}
/**
 * Context for MCP tool executions.
 * Contains non-sensitive connection information about the MCP server
 * identity. Since server_name is user controlled and arbitrary, we
 * also include connection information (e.g., command or url) to
 * help identify the MCP server.
 *
 * NOTE: In the future, consider defining a shared sanitized interface
 * from MCPServerConfig to avoid duplication and ensure consistency.
 */
export interface McpToolContext {
    server_name: string;
    tool_name: string;
    command?: string;
    args?: string[];
    cwd?: string;
    url?: string;
    tcp?: string;
}
/**
 * BeforeTool hook input
 */
export interface BeforeToolInput extends HookInput {
    tool_name: string;
    tool_input: Record<string, unknown>;
    mcp_context?: McpToolContext;
}
/**
 * BeforeTool hook output
 */
export interface BeforeToolOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'BeforeTool';
        tool_input?: Record<string, unknown>;
    };
}
/**
 * AfterTool hook input
 */
export interface AfterToolInput extends HookInput {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_response: Record<string, unknown>;
    mcp_context?: McpToolContext;
}
/**
 * AfterTool hook output
 */
export interface AfterToolOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'AfterTool';
        additionalContext?: string;
    };
}
/**
 * BeforeAgent hook input
 */
export interface BeforeAgentInput extends HookInput {
    prompt: string;
}
/**
 * BeforeAgent hook output
 */
export interface BeforeAgentOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'BeforeAgent';
        additionalContext?: string;
    };
}
/**
 * Notification types
 */
export declare enum NotificationType {
    ToolPermission = "ToolPermission"
}
/**
 * Notification hook input
 */
export interface NotificationInput extends HookInput {
    notification_type: NotificationType;
    message: string;
    details: Record<string, unknown>;
}
/**
 * Notification hook output
 */
export interface NotificationOutput {
    suppressOutput?: boolean;
    systemMessage?: string;
}
/**
 * AfterAgent hook input
 */
export interface AfterAgentInput extends HookInput {
    prompt: string;
    prompt_response: string;
    stop_hook_active: boolean;
}
/**
 * SessionStart source types
 */
export declare enum SessionStartSource {
    Startup = "startup",
    Resume = "resume",
    Clear = "clear"
}
/**
 * SessionStart hook input
 */
export interface SessionStartInput extends HookInput {
    source: SessionStartSource;
}
/**
 * SessionStart hook output
 */
export interface SessionStartOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'SessionStart';
        additionalContext?: string;
    };
}
/**
 * SessionEnd reason types
 */
export declare enum SessionEndReason {
    Exit = "exit",
    Clear = "clear",
    Logout = "logout",
    PromptInputExit = "prompt_input_exit",
    Other = "other"
}
/**
 * SessionEnd hook input
 */
export interface SessionEndInput extends HookInput {
    reason: SessionEndReason;
}
/**
 * PreCompress trigger types
 */
export declare enum PreCompressTrigger {
    Manual = "manual",
    Auto = "auto"
}
/**
 * PreCompress hook input
 */
export interface PreCompressInput extends HookInput {
    trigger: PreCompressTrigger;
}
/**
 * PreCompress hook output
 */
export interface PreCompressOutput {
    suppressOutput?: boolean;
    systemMessage?: string;
}
/**
 * BeforeModel hook input - uses decoupled types
 */
export interface BeforeModelInput extends HookInput {
    llm_request: LLMRequest;
}
/**
 * BeforeModel hook output
 */
export interface BeforeModelOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'BeforeModel';
        llm_request?: Partial<LLMRequest>;
        llm_response?: LLMResponse;
    };
}
/**
 * AfterModel hook input - uses decoupled types
 */
export interface AfterModelInput extends HookInput {
    llm_request: LLMRequest;
    llm_response: LLMResponse;
}
/**
 * AfterModel hook output
 */
export interface AfterModelOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'AfterModel';
        llm_response?: Partial<LLMResponse>;
    };
}
/**
 * BeforeToolSelection hook input - uses decoupled types
 */
export interface BeforeToolSelectionInput extends HookInput {
    llm_request: LLMRequest;
}
/**
 * BeforeToolSelection hook output
 */
export interface BeforeToolSelectionOutput extends HookOutput {
    hookSpecificOutput?: {
        hookEventName: 'BeforeToolSelection';
        toolConfig?: HookToolConfig;
    };
}
/**
 * Hook execution result
 */
export interface HookExecutionResult {
    hookConfig: HookConfig;
    eventName: HookEventName;
    success: boolean;
    output?: HookOutput;
    stdout?: string;
    stderr?: string;
    exitCode?: number;
    duration: number;
    error?: Error;
}
/**
 * Hook execution plan for an event
 */
export interface HookExecutionPlan {
    eventName: HookEventName;
    hookConfigs: HookConfig[];
    sequential: boolean;
}
