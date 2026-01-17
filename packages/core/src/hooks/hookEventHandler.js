/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { HookEventName } from './types.js';
import { defaultHookTranslator } from './hookTranslator.js';
import { logHookCall } from '../telemetry/loggers.js';
import { HookCallEvent } from '../telemetry/types.js';
import { MessageBusType, } from '../confirmation-bus/types.js';
import { debugLogger } from '../utils/debugLogger.js';
import { coreEvents } from '../utils/events.js';
/**
 * Validates that a value is a non-null object
 */
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
/**
 * Validates BeforeTool input fields
 */
function validateBeforeToolInput(input) {
    const toolName = input['tool_name'];
    const toolInput = input['tool_input'];
    const mcpContext = input['mcp_context'];
    if (typeof toolName !== 'string') {
        throw new Error('Invalid input for BeforeTool hook event: tool_name must be a string');
    }
    if (!isObject(toolInput)) {
        throw new Error('Invalid input for BeforeTool hook event: tool_input must be an object');
    }
    if (mcpContext !== undefined && !isObject(mcpContext)) {
        throw new Error('Invalid input for BeforeTool hook event: mcp_context must be an object');
    }
    return {
        toolName,
        toolInput,
        mcpContext: mcpContext,
    };
}
/**
 * Validates AfterTool input fields
 */
function validateAfterToolInput(input) {
    const toolName = input['tool_name'];
    const toolInput = input['tool_input'];
    const toolResponse = input['tool_response'];
    const mcpContext = input['mcp_context'];
    if (typeof toolName !== 'string') {
        throw new Error('Invalid input for AfterTool hook event: tool_name must be a string');
    }
    if (!isObject(toolInput)) {
        throw new Error('Invalid input for AfterTool hook event: tool_input must be an object');
    }
    if (!isObject(toolResponse)) {
        throw new Error('Invalid input for AfterTool hook event: tool_response must be an object');
    }
    if (mcpContext !== undefined && !isObject(mcpContext)) {
        throw new Error('Invalid input for AfterTool hook event: mcp_context must be an object');
    }
    return {
        toolName,
        toolInput,
        toolResponse,
        mcpContext: mcpContext,
    };
}
/**
 * Validates BeforeAgent input fields
 */
function validateBeforeAgentInput(input) {
    const prompt = input['prompt'];
    if (typeof prompt !== 'string') {
        throw new Error('Invalid input for BeforeAgent hook event: prompt must be a string');
    }
    return { prompt };
}
/**
 * Validates AfterAgent input fields
 */
function validateAfterAgentInput(input) {
    const prompt = input['prompt'];
    const promptResponse = input['prompt_response'];
    const stopHookActive = input['stop_hook_active'];
    if (typeof prompt !== 'string') {
        throw new Error('Invalid input for AfterAgent hook event: prompt must be a string');
    }
    if (typeof promptResponse !== 'string') {
        throw new Error('Invalid input for AfterAgent hook event: prompt_response must be a string');
    }
    // stopHookActive defaults to false if not a boolean
    return {
        prompt,
        promptResponse,
        stopHookActive: typeof stopHookActive === 'boolean' ? stopHookActive : false,
    };
}
/**
 * Validates model-related input fields (llm_request)
 */
function validateModelInput(input, eventName) {
    const llmRequest = input['llm_request'];
    if (!isObject(llmRequest)) {
        throw new Error(`Invalid input for ${eventName} hook event: llm_request must be an object`);
    }
    return { llmRequest: llmRequest };
}
/**
 * Validates AfterModel input fields
 */
function validateAfterModelInput(input) {
    const llmRequest = input['llm_request'];
    const llmResponse = input['llm_response'];
    if (!isObject(llmRequest)) {
        throw new Error('Invalid input for AfterModel hook event: llm_request must be an object');
    }
    if (!isObject(llmResponse)) {
        throw new Error('Invalid input for AfterModel hook event: llm_response must be an object');
    }
    return {
        llmRequest: llmRequest,
        llmResponse: llmResponse,
    };
}
/**
 * Validates Notification input fields
 */
function validateNotificationInput(input) {
    const notificationType = input['notification_type'];
    const message = input['message'];
    const details = input['details'];
    if (typeof notificationType !== 'string') {
        throw new Error('Invalid input for Notification hook event: notification_type must be a string');
    }
    if (typeof message !== 'string') {
        throw new Error('Invalid input for Notification hook event: message must be a string');
    }
    if (!isObject(details)) {
        throw new Error('Invalid input for Notification hook event: details must be an object');
    }
    return {
        notificationType: notificationType,
        message,
        details,
    };
}
/**
 * Validates SessionStart input fields
 */
function validateSessionStartInput(input) {
    const source = input['source'];
    if (typeof source !== 'string') {
        throw new Error('Invalid input for SessionStart hook event: source must be a string');
    }
    return {
        source: source,
    };
}
/**
 * Validates SessionEnd input fields
 */
function validateSessionEndInput(input) {
    const reason = input['reason'];
    if (typeof reason !== 'string') {
        throw new Error('Invalid input for SessionEnd hook event: reason must be a string');
    }
    return {
        reason: reason,
    };
}
/**
 * Validates PreCompress input fields
 */
function validatePreCompressInput(input) {
    const trigger = input['trigger'];
    if (typeof trigger !== 'string') {
        throw new Error('Invalid input for PreCompress hook event: trigger must be a string');
    }
    return {
        trigger: trigger,
    };
}
/**
 * Hook event bus that coordinates hook execution across the system
 */
export class HookEventHandler {
    config;
    hookPlanner;
    hookRunner;
    hookAggregator;
    messageBus;
    constructor(config, logger, hookPlanner, hookRunner, hookAggregator, messageBus) {
        this.config = config;
        this.hookPlanner = hookPlanner;
        this.hookRunner = hookRunner;
        this.hookAggregator = hookAggregator;
        this.messageBus = messageBus;
        // Subscribe to hook execution requests from MessageBus
        if (this.messageBus) {
            this.messageBus.subscribe(MessageBusType.HOOK_EXECUTION_REQUEST, (request) => this.handleHookExecutionRequest(request));
        }
    }
    /**
     * Fire a BeforeTool event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireBeforeToolEvent(toolName, toolInput, mcpContext) {
        const input = {
            ...this.createBaseInput(HookEventName.BeforeTool),
            tool_name: toolName,
            tool_input: toolInput,
            ...(mcpContext && { mcp_context: mcpContext }),
        };
        const context = { toolName };
        return this.executeHooks(HookEventName.BeforeTool, input, context);
    }
    /**
     * Fire an AfterTool event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireAfterToolEvent(toolName, toolInput, toolResponse, mcpContext) {
        const input = {
            ...this.createBaseInput(HookEventName.AfterTool),
            tool_name: toolName,
            tool_input: toolInput,
            tool_response: toolResponse,
            ...(mcpContext && { mcp_context: mcpContext }),
        };
        const context = { toolName };
        return this.executeHooks(HookEventName.AfterTool, input, context);
    }
    /**
     * Fire a BeforeAgent event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireBeforeAgentEvent(prompt) {
        const input = {
            ...this.createBaseInput(HookEventName.BeforeAgent),
            prompt,
        };
        return this.executeHooks(HookEventName.BeforeAgent, input);
    }
    /**
     * Fire a Notification event
     */
    async fireNotificationEvent(type, message, details) {
        const input = {
            ...this.createBaseInput(HookEventName.Notification),
            notification_type: type,
            message,
            details,
        };
        return this.executeHooks(HookEventName.Notification, input);
    }
    /**
     * Fire an AfterAgent event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireAfterAgentEvent(prompt, promptResponse, stopHookActive = false) {
        const input = {
            ...this.createBaseInput(HookEventName.AfterAgent),
            prompt,
            prompt_response: promptResponse,
            stop_hook_active: stopHookActive,
        };
        return this.executeHooks(HookEventName.AfterAgent, input);
    }
    /**
     * Fire a SessionStart event
     */
    async fireSessionStartEvent(source) {
        const input = {
            ...this.createBaseInput(HookEventName.SessionStart),
            source,
        };
        const context = { trigger: source };
        return this.executeHooks(HookEventName.SessionStart, input, context);
    }
    /**
     * Fire a SessionEnd event
     */
    async fireSessionEndEvent(reason) {
        const input = {
            ...this.createBaseInput(HookEventName.SessionEnd),
            reason,
        };
        const context = { trigger: reason };
        return this.executeHooks(HookEventName.SessionEnd, input, context);
    }
    /**
     * Fire a PreCompress event
     */
    async firePreCompressEvent(trigger) {
        const input = {
            ...this.createBaseInput(HookEventName.PreCompress),
            trigger,
        };
        const context = { trigger };
        return this.executeHooks(HookEventName.PreCompress, input, context);
    }
    /**
     * Fire a BeforeModel event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireBeforeModelEvent(llmRequest) {
        const input = {
            ...this.createBaseInput(HookEventName.BeforeModel),
            llm_request: defaultHookTranslator.toHookLLMRequest(llmRequest),
        };
        return this.executeHooks(HookEventName.BeforeModel, input);
    }
    /**
     * Fire an AfterModel event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireAfterModelEvent(llmRequest, llmResponse) {
        const input = {
            ...this.createBaseInput(HookEventName.AfterModel),
            llm_request: defaultHookTranslator.toHookLLMRequest(llmRequest),
            llm_response: defaultHookTranslator.toHookLLMResponse(llmResponse),
        };
        return this.executeHooks(HookEventName.AfterModel, input);
    }
    /**
     * Fire a BeforeToolSelection event
     * Called by handleHookExecutionRequest - executes hooks directly
     */
    async fireBeforeToolSelectionEvent(llmRequest) {
        const input = {
            ...this.createBaseInput(HookEventName.BeforeToolSelection),
            llm_request: defaultHookTranslator.toHookLLMRequest(llmRequest),
        };
        return this.executeHooks(HookEventName.BeforeToolSelection, input);
    }
    /**
     * Execute hooks for a specific event (direct execution without MessageBus)
     * Used as fallback when MessageBus is not available
     */
    async executeHooks(eventName, input, context) {
        try {
            // Create execution plan
            const plan = this.hookPlanner.createExecutionPlan(eventName, context);
            if (!plan || plan.hookConfigs.length === 0) {
                return {
                    success: true,
                    allOutputs: [],
                    errors: [],
                    totalDuration: 0,
                };
            }
            const onHookStart = (config, index) => {
                coreEvents.emitHookStart({
                    hookName: this.getHookName(config),
                    eventName,
                    hookIndex: index + 1,
                    totalHooks: plan.hookConfigs.length,
                });
            };
            const onHookEnd = (config, result) => {
                coreEvents.emitHookEnd({
                    hookName: this.getHookName(config),
                    eventName,
                    success: result.success,
                });
            };
            // Execute hooks according to the plan's strategy
            const results = plan.sequential
                ? await this.hookRunner.executeHooksSequential(plan.hookConfigs, eventName, input, onHookStart, onHookEnd)
                : await this.hookRunner.executeHooksParallel(plan.hookConfigs, eventName, input, onHookStart, onHookEnd);
            // Aggregate results
            const aggregated = this.hookAggregator.aggregateResults(results, eventName);
            // Process common hook output fields centrally
            this.processCommonHookOutputFields(aggregated);
            // Log hook execution
            this.logHookExecution(eventName, input, results, aggregated);
            return aggregated;
        }
        catch (error) {
            debugLogger.error(`Hook event bus error for ${eventName}: ${error}`);
            return {
                success: false,
                allOutputs: [],
                errors: [error instanceof Error ? error : new Error(String(error))],
                totalDuration: 0,
            };
        }
    }
    /**
     * Create base hook input with common fields
     */
    createBaseInput(eventName) {
        // Get the transcript path from the ChatRecordingService if available
        const transcriptPath = this.config
            .getGeminiClient()
            ?.getChatRecordingService()
            ?.getConversationFilePath() ?? '';
        return {
            session_id: this.config.getSessionId(),
            transcript_path: transcriptPath,
            cwd: this.config.getWorkingDir(),
            hook_event_name: eventName,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Log hook execution for observability
     */
    logHookExecution(eventName, input, results, aggregated) {
        const failedHooks = results.filter((r) => !r.success);
        const successCount = results.length - failedHooks.length;
        const errorCount = failedHooks.length;
        if (errorCount > 0) {
            const failedNames = failedHooks
                .map((r) => this.getHookNameFromResult(r))
                .join(', ');
            debugLogger.warn(`Hook execution for ${eventName}: ${successCount} succeeded, ${errorCount} failed (${failedNames}), ` +
                `total duration: ${aggregated.totalDuration}ms`);
            coreEvents.emitFeedback('warning', `Hook(s) [${failedNames}] failed for event ${eventName}. Press F12 to see the debug drawer for more details.\n`);
        }
        else {
            debugLogger.debug(`Hook execution for ${eventName}: ${successCount} hooks executed successfully, ` +
                `total duration: ${aggregated.totalDuration}ms`);
        }
        // Log individual hook calls to telemetry
        for (const result of results) {
            // Determine hook name and type for telemetry
            const hookName = this.getHookNameFromResult(result);
            const hookType = this.getHookTypeFromResult(result);
            const hookCallEvent = new HookCallEvent(eventName, hookType, hookName, { ...input }, result.duration, result.success, result.output ? { ...result.output } : undefined, result.exitCode, result.stdout, result.stderr, result.error?.message);
            logHookCall(this.config, hookCallEvent);
        }
        // Log individual errors
        for (const error of aggregated.errors) {
            debugLogger.warn(`Hook execution error: ${error.message}`);
        }
    }
    /**
     * Process common hook output fields centrally
     */
    processCommonHookOutputFields(aggregated) {
        if (!aggregated.finalOutput) {
            return;
        }
        // Handle systemMessage - show to user in transcript mode (not to agent)
        const systemMessage = aggregated.finalOutput.systemMessage;
        if (systemMessage && !aggregated.finalOutput.suppressOutput) {
            debugLogger.warn(`Hook system message: ${systemMessage}`);
        }
        // Handle suppressOutput - already handled by not logging above when true
        // Handle continue=false - this should stop the entire agent execution
        if (aggregated.finalOutput.shouldStopExecution()) {
            const stopReason = aggregated.finalOutput.getEffectiveReason();
            debugLogger.log(`Hook requested to stop execution: ${stopReason}`);
            // Note: The actual stopping of execution must be handled by integration points
            // as they need to interpret this signal in the context of their specific workflow
            // This is just logging the request centrally
        }
        // Other common fields like decision/reason are handled by specific hook output classes
    }
    /**
     * Get hook name from config for display or telemetry
     */
    getHookName(config) {
        return config.name || config.command || 'unknown-command';
    }
    /**
     * Get hook name from execution result for telemetry
     */
    getHookNameFromResult(result) {
        return this.getHookName(result.hookConfig);
    }
    /**
     * Get hook type from execution result for telemetry
     */
    getHookTypeFromResult(result) {
        return result.hookConfig.type;
    }
    /**
     * Handle hook execution requests from MessageBus
     * This method routes the request to the appropriate fire*Event method
     * and publishes the response back through MessageBus
     *
     * The request input only contains event-specific fields. This method adds
     * the common base fields (session_id, cwd, etc.) before routing.
     */
    async handleHookExecutionRequest(request) {
        try {
            // Add base fields to the input
            const enrichedInput = {
                ...this.createBaseInput(request.eventName),
                ...request.input,
            };
            let result;
            // Route to appropriate event handler based on eventName
            switch (request.eventName) {
                case HookEventName.BeforeTool: {
                    const { toolName, toolInput, mcpContext } = validateBeforeToolInput(enrichedInput);
                    result = await this.fireBeforeToolEvent(toolName, toolInput, mcpContext);
                    break;
                }
                case HookEventName.AfterTool: {
                    const { toolName, toolInput, toolResponse, mcpContext } = validateAfterToolInput(enrichedInput);
                    result = await this.fireAfterToolEvent(toolName, toolInput, toolResponse, mcpContext);
                    break;
                }
                case HookEventName.BeforeAgent: {
                    const { prompt } = validateBeforeAgentInput(enrichedInput);
                    result = await this.fireBeforeAgentEvent(prompt);
                    break;
                }
                case HookEventName.AfterAgent: {
                    const { prompt, promptResponse, stopHookActive } = validateAfterAgentInput(enrichedInput);
                    result = await this.fireAfterAgentEvent(prompt, promptResponse, stopHookActive);
                    break;
                }
                case HookEventName.BeforeModel: {
                    const { llmRequest } = validateModelInput(enrichedInput, 'BeforeModel');
                    const translatedRequest = defaultHookTranslator.toHookLLMRequest(llmRequest);
                    // Update the enrichedInput with translated request
                    enrichedInput['llm_request'] = translatedRequest;
                    result = await this.fireBeforeModelEvent(llmRequest);
                    break;
                }
                case HookEventName.AfterModel: {
                    const { llmRequest, llmResponse } = validateAfterModelInput(enrichedInput);
                    const translatedRequest = defaultHookTranslator.toHookLLMRequest(llmRequest);
                    const translatedResponse = defaultHookTranslator.toHookLLMResponse(llmResponse);
                    // Update the enrichedInput with translated versions
                    enrichedInput['llm_request'] = translatedRequest;
                    enrichedInput['llm_response'] = translatedResponse;
                    result = await this.fireAfterModelEvent(llmRequest, llmResponse);
                    break;
                }
                case HookEventName.BeforeToolSelection: {
                    const { llmRequest } = validateModelInput(enrichedInput, 'BeforeToolSelection');
                    const translatedRequest = defaultHookTranslator.toHookLLMRequest(llmRequest);
                    // Update the enrichedInput with translated request
                    enrichedInput['llm_request'] = translatedRequest;
                    result = await this.fireBeforeToolSelectionEvent(llmRequest);
                    break;
                }
                case HookEventName.Notification: {
                    const { notificationType, message, details } = validateNotificationInput(enrichedInput);
                    result = await this.fireNotificationEvent(notificationType, message, details);
                    break;
                }
                case HookEventName.SessionStart: {
                    const { source } = validateSessionStartInput(enrichedInput);
                    result = await this.fireSessionStartEvent(source);
                    break;
                }
                case HookEventName.SessionEnd: {
                    const { reason } = validateSessionEndInput(enrichedInput);
                    result = await this.fireSessionEndEvent(reason);
                    break;
                }
                case HookEventName.PreCompress: {
                    const { trigger } = validatePreCompressInput(enrichedInput);
                    result = await this.firePreCompressEvent(trigger);
                    break;
                }
                default:
                    throw new Error(`Unsupported hook event: ${request.eventName}`);
            }
            // Publish response through MessageBus
            if (this.messageBus) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.messageBus.publish({
                    type: MessageBusType.HOOK_EXECUTION_RESPONSE,
                    correlationId: request.correlationId,
                    success: result.success,
                    output: result.finalOutput,
                });
            }
        }
        catch (error) {
            // Publish error response
            if (this.messageBus) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.messageBus.publish({
                    type: MessageBusType.HOOK_EXECUTION_RESPONSE,
                    correlationId: request.correlationId,
                    success: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            }
        }
    }
}
//# sourceMappingURL=hookEventHandler.js.map