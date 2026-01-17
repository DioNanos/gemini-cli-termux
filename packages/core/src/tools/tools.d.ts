/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { FunctionDeclaration, PartListUnion } from '@google/genai';
import { ToolErrorType } from './tool-error.js';
import type { DiffUpdateResult } from '../ide/ide-client.js';
import type { ShellExecutionConfig } from '../services/shellExecutionService.js';
import type { AnsiOutput } from '../utils/terminalSerializer.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
/**
 * Represents a validated and ready-to-execute tool call.
 * An instance of this is created by a `ToolBuilder`.
 */
export interface ToolInvocation<TParams extends object, TResult extends ToolResult> {
    /**
     * The validated parameters for this specific invocation.
     */
    params: TParams;
    /**
     * Gets a pre-execution description of the tool operation.
     *
     * @returns A markdown string describing what the tool will do.
     */
    getDescription(): string;
    /**
     * Determines what file system paths the tool will affect.
     * @returns A list of such paths.
     */
    toolLocations(): ToolLocation[];
    /**
     * Determines if the tool should prompt for confirmation before execution.
     * @returns Confirmation details or false if no confirmation is needed.
     */
    shouldConfirmExecute(abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    /**
     * Executes the tool with the validated parameters.
     * @param signal AbortSignal for tool cancellation.
     * @param updateOutput Optional callback to stream output.
     * @returns Result of the tool execution.
     */
    execute(signal: AbortSignal, updateOutput?: (output: string | AnsiOutput) => void, shellExecutionConfig?: ShellExecutionConfig): Promise<TResult>;
}
/**
 * Options for policy updates that can be customized by tool invocations.
 */
export interface PolicyUpdateOptions {
    commandPrefix?: string | string[];
    mcpName?: string;
}
/**
 * A convenience base class for ToolInvocation.
 */
export declare abstract class BaseToolInvocation<TParams extends object, TResult extends ToolResult> implements ToolInvocation<TParams, TResult> {
    readonly params: TParams;
    protected readonly messageBus: MessageBus;
    readonly _toolName?: string | undefined;
    readonly _toolDisplayName?: string | undefined;
    readonly _serverName?: string | undefined;
    constructor(params: TParams, messageBus: MessageBus, _toolName?: string | undefined, _toolDisplayName?: string | undefined, _serverName?: string | undefined);
    abstract getDescription(): string;
    toolLocations(): ToolLocation[];
    shouldConfirmExecute(abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    /**
     * Returns tool-specific options for policy updates.
     * Subclasses can override this to provide additional options like
     * commandPrefix (for shell) or mcpName (for MCP tools).
     */
    protected getPolicyUpdateOptions(_outcome: ToolConfirmationOutcome): PolicyUpdateOptions | undefined;
    /**
     * Helper method to publish a policy update when user selects
     * ProceedAlways or ProceedAlwaysAndSave.
     */
    protected publishPolicyUpdate(outcome: ToolConfirmationOutcome): Promise<void>;
    /**
     * Subclasses should override this method to provide custom confirmation UI
     * when the policy engine's decision is 'ASK_USER'.
     * The base implementation provides a generic confirmation prompt.
     */
    protected getConfirmationDetails(_abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    protected getMessageBusDecision(abortSignal: AbortSignal): Promise<'ALLOW' | 'DENY' | 'ASK_USER'>;
    abstract execute(signal: AbortSignal, updateOutput?: (output: string | AnsiOutput) => void, shellExecutionConfig?: ShellExecutionConfig): Promise<TResult>;
}
/**
 * A type alias for a tool invocation where the specific parameter and result types are not known.
 */
export type AnyToolInvocation = ToolInvocation<object, ToolResult>;
/**
 * Interface for a tool builder that validates parameters and creates invocations.
 */
export interface ToolBuilder<TParams extends object, TResult extends ToolResult> {
    /**
     * The internal name of the tool (used for API calls).
     */
    name: string;
    /**
     * The user-friendly display name of the tool.
     */
    displayName: string;
    /**
     * Description of what the tool does.
     */
    description: string;
    /**
     * The kind of tool for categorization and permissions
     */
    kind: Kind;
    /**
     * Function declaration schema from @google/genai.
     */
    schema: FunctionDeclaration;
    /**
     * Whether the tool's output should be rendered as markdown.
     */
    isOutputMarkdown: boolean;
    /**
     * Whether the tool supports live (streaming) output.
     */
    canUpdateOutput: boolean;
    /**
     * Validates raw parameters and builds a ready-to-execute invocation.
     * @param params The raw, untrusted parameters from the model.
     * @returns A valid `ToolInvocation` if successful. Throws an error if validation fails.
     */
    build(params: TParams): ToolInvocation<TParams, TResult>;
}
/**
 * New base class for tools that separates validation from execution.
 * New tools should extend this class.
 */
export declare abstract class DeclarativeTool<TParams extends object, TResult extends ToolResult> implements ToolBuilder<TParams, TResult> {
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly kind: Kind;
    readonly parameterSchema: unknown;
    readonly messageBus: MessageBus;
    readonly isOutputMarkdown: boolean;
    readonly canUpdateOutput: boolean;
    readonly extensionName?: string | undefined;
    readonly extensionId?: string | undefined;
    constructor(name: string, displayName: string, description: string, kind: Kind, parameterSchema: unknown, messageBus: MessageBus, isOutputMarkdown?: boolean, canUpdateOutput?: boolean, extensionName?: string | undefined, extensionId?: string | undefined);
    get schema(): FunctionDeclaration;
    /**
     * Validates the raw tool parameters.
     * Subclasses should override this to add custom validation logic
     * beyond the JSON schema check.
     * @param params The raw parameters from the model.
     * @returns An error message string if invalid, null otherwise.
     */
    validateToolParams(_params: TParams): string | null;
    /**
     * The core of the new pattern. It validates parameters and, if successful,
     * returns a `ToolInvocation` object that encapsulates the logic for the
     * specific, validated call.
     * @param params The raw, untrusted parameters from the model.
     * @returns A `ToolInvocation` instance.
     */
    abstract build(params: TParams): ToolInvocation<TParams, TResult>;
    /**
     * A convenience method that builds and executes the tool in one step.
     * Throws an error if validation fails.
     * @param params The raw, untrusted parameters from the model.
     * @param signal AbortSignal for tool cancellation.
     * @param updateOutput Optional callback to stream output.
     * @returns The result of the tool execution.
     */
    buildAndExecute(params: TParams, signal: AbortSignal, updateOutput?: (output: string | AnsiOutput) => void, shellExecutionConfig?: ShellExecutionConfig): Promise<TResult>;
    /**
     * Similar to `build` but never throws.
     * @param params The raw, untrusted parameters from the model.
     * @returns A `ToolInvocation` instance.
     */
    private silentBuild;
    /**
     * A convenience method that builds and executes the tool in one step.
     * Never throws.
     * @param params The raw, untrusted parameters from the model.
     * @param abortSignal a signal to abort.
     * @returns The result of the tool execution.
     */
    validateBuildAndExecute(params: TParams, abortSignal: AbortSignal): Promise<ToolResult>;
}
/**
 * New base class for declarative tools that separates validation from execution.
 * New tools should extend this class, which provides a `build` method that
 * validates parameters before deferring to a `createInvocation` method for
 * the final `ToolInvocation` object instantiation.
 */
export declare abstract class BaseDeclarativeTool<TParams extends object, TResult extends ToolResult> extends DeclarativeTool<TParams, TResult> {
    build(params: TParams): ToolInvocation<TParams, TResult>;
    validateToolParams(params: TParams): string | null;
    protected validateToolParamValues(_params: TParams): string | null;
    protected abstract createInvocation(params: TParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<TParams, TResult>;
}
/**
 * A type alias for a declarative tool where the specific parameter and result types are not known.
 */
export type AnyDeclarativeTool = DeclarativeTool<object, ToolResult>;
/**
 * Type guard to check if an object is a Tool.
 * @param obj The object to check.
 * @returns True if the object is a Tool, false otherwise.
 */
export declare function isTool(obj: unknown): obj is AnyDeclarativeTool;
export interface ToolResult {
    /**
     * Content meant to be included in LLM history.
     * This should represent the factual outcome of the tool execution.
     */
    llmContent: PartListUnion;
    /**
     * Markdown string for user display.
     * This provides a user-friendly summary or visualization of the result.
     * NOTE: This might also be considered UI-specific and could potentially be
     * removed or modified in a further refactor if the server becomes purely API-driven.
     * For now, we keep it as the core logic in ReadFileTool currently produces it.
     */
    returnDisplay: ToolResultDisplay;
    /**
     * If this property is present, the tool call is considered a failure.
     */
    error?: {
        message: string;
        type?: ToolErrorType;
    };
}
/**
 * Detects cycles in a JSON schemas due to `$ref`s.
 * @param schema The root of the JSON schema.
 * @returns `true` if a cycle is detected, `false` otherwise.
 */
export declare function hasCycleInSchema(schema: object): boolean;
export interface TodoList {
    todos: Todo[];
}
export type ToolResultDisplay = string | FileDiff | AnsiOutput | TodoList;
export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export interface Todo {
    description: string;
    status: TodoStatus;
}
export interface FileDiff {
    fileDiff: string;
    fileName: string;
    filePath: string;
    originalContent: string | null;
    newContent: string;
    diffStat?: DiffStat;
    isNewFile?: boolean;
}
export interface DiffStat {
    model_added_lines: number;
    model_removed_lines: number;
    model_added_chars: number;
    model_removed_chars: number;
    user_added_lines: number;
    user_removed_lines: number;
    user_added_chars: number;
    user_removed_chars: number;
}
export interface ToolEditConfirmationDetails {
    type: 'edit';
    title: string;
    onConfirm: (outcome: ToolConfirmationOutcome, payload?: ToolConfirmationPayload) => Promise<void>;
    fileName: string;
    filePath: string;
    fileDiff: string;
    originalContent: string | null;
    newContent: string;
    isModifying?: boolean;
    ideConfirmation?: Promise<DiffUpdateResult>;
}
export interface ToolConfirmationPayload {
    newContent: string;
}
export interface ToolExecuteConfirmationDetails {
    type: 'exec';
    title: string;
    onConfirm: (outcome: ToolConfirmationOutcome) => Promise<void>;
    command: string;
    rootCommand: string;
    rootCommands: string[];
    commands?: string[];
}
export interface ToolMcpConfirmationDetails {
    type: 'mcp';
    title: string;
    serverName: string;
    toolName: string;
    toolDisplayName: string;
    onConfirm: (outcome: ToolConfirmationOutcome) => Promise<void>;
}
export interface ToolInfoConfirmationDetails {
    type: 'info';
    title: string;
    onConfirm: (outcome: ToolConfirmationOutcome) => Promise<void>;
    prompt: string;
    urls?: string[];
}
export type ToolCallConfirmationDetails = ToolEditConfirmationDetails | ToolExecuteConfirmationDetails | ToolMcpConfirmationDetails | ToolInfoConfirmationDetails;
export declare enum ToolConfirmationOutcome {
    ProceedOnce = "proceed_once",
    ProceedAlways = "proceed_always",
    ProceedAlwaysAndSave = "proceed_always_and_save",
    ProceedAlwaysServer = "proceed_always_server",
    ProceedAlwaysTool = "proceed_always_tool",
    ModifyWithEditor = "modify_with_editor",
    Cancel = "cancel"
}
export declare enum Kind {
    Read = "read",
    Edit = "edit",
    Delete = "delete",
    Move = "move",
    Search = "search",
    Execute = "execute",
    Think = "think",
    Fetch = "fetch",
    Other = "other"
}
export declare const MUTATOR_KINDS: Kind[];
export interface ToolLocation {
    path: string;
    line?: number;
}
