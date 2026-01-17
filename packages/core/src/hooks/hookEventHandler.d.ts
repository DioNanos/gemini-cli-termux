/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Logger } from '@opentelemetry/api-logs';
import type { Config } from '../config/config.js';
import type { HookPlanner } from './hookPlanner.js';
import type { HookRunner } from './hookRunner.js';
import type { HookAggregator, AggregatedHookResult } from './hookAggregator.js';
import type { NotificationType, SessionStartSource, SessionEndReason, PreCompressTrigger, McpToolContext } from './types.js';
import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
/**
 * Hook event bus that coordinates hook execution across the system
 */
export declare class HookEventHandler {
    private readonly config;
    private readonly hookPlanner;
    private readonly hookRunner;
    private readonly hookAggregator;
    private readonly messageBus;
    constructor(config: Config, logger: Logger, hookPlanner: HookPlanner, hookRunner: HookRunner, hookAggregator: HookAggregator, messageBus: MessageBus);
    /**
     * Fire a BeforeTool event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireBeforeToolEvent(toolName: string, toolInput: Record<string, unknown>, mcpContext?: McpToolContext): Promise<AggregatedHookResult>;
    /**
     * Fire an AfterTool event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireAfterToolEvent(toolName: string, toolInput: Record<string, unknown>, toolResponse: Record<string, unknown>, mcpContext?: McpToolContext): Promise<AggregatedHookResult>;
    /**
     * Fire a BeforeAgent event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireBeforeAgentEvent(prompt: string): Promise<AggregatedHookResult>;
    /**
     * Fire a Notification event
     */
    fireNotificationEvent(type: NotificationType, message: string, details: Record<string, unknown>): Promise<AggregatedHookResult>;
    /**
     * Fire an AfterAgent event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireAfterAgentEvent(prompt: string, promptResponse: string, stopHookActive?: boolean): Promise<AggregatedHookResult>;
    /**
     * Fire a SessionStart event
     */
    fireSessionStartEvent(source: SessionStartSource): Promise<AggregatedHookResult>;
    /**
     * Fire a SessionEnd event
     */
    fireSessionEndEvent(reason: SessionEndReason): Promise<AggregatedHookResult>;
    /**
     * Fire a PreCompress event
     */
    firePreCompressEvent(trigger: PreCompressTrigger): Promise<AggregatedHookResult>;
    /**
     * Fire a BeforeModel event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireBeforeModelEvent(llmRequest: GenerateContentParameters): Promise<AggregatedHookResult>;
    /**
     * Fire an AfterModel event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireAfterModelEvent(llmRequest: GenerateContentParameters, llmResponse: GenerateContentResponse): Promise<AggregatedHookResult>;
    /**
     * Fire a BeforeToolSelection event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    fireBeforeToolSelectionEvent(llmRequest: GenerateContentParameters): Promise<AggregatedHookResult>;
    /**
     * Execute hooks for a specific event (direct execution without MessageBus)
     * Used as fallback when MessageBus is not available
     */
    private executeHooks;
    /**
     * Create base hook input with common fields
     */
    private createBaseInput;
    /**
     * Log hook execution for observability
     */
    private logHookExecution;
    /**
     * Process common hook output fields centrally
     */
    private processCommonHookOutputFields;
    /**
     * Get hook name from config for display or telemetry
     */
    private getHookName;
    /**
     * Get hook name from execution result for telemetry
     */
    private getHookNameFromResult;
    /**
     * Get hook type from execution result for telemetry
     */
    private getHookTypeFromResult;
    /**
     * Handle hook execution requests from MessageBus
     * This method routes the request to the appropriate fire*Event method
     * and publishes the response back through MessageBus
     *
     * The request input only contains event-specific fields. This method adds
     * the common base fields (session_id, cwd, etc.) before routing.
     */
    private handleHookExecutionRequest;
}
