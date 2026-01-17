/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { toParts } from '../code_assist/converter.js';
import { createUserContent, FinishReason } from '@google/genai';
import { retryWithBackoff, isRetryableError } from '../utils/retry.js';
import { resolveModel, isGemini2Model, isPreviewModel, } from '../config/models.js';
import { hasCycleInSchema } from '../tools/tools.js';
import { logContentRetry, logContentRetryFailure, } from '../telemetry/loggers.js';
import { ChatRecordingService, } from '../services/chatRecordingService.js';
import { ContentRetryEvent, ContentRetryFailureEvent, } from '../telemetry/types.js';
import { handleFallback } from '../fallback/handler.js';
import { isFunctionResponse } from '../utils/messageInspectors.js';
import { partListUnionToString } from './geminiRequest.js';
import { estimateTokenCountSync } from '../utils/tokenCalculation.js';
import { applyModelSelection, createAvailabilityContextProvider, } from '../availability/policyHelpers.js';
import { fireAfterModelHook, fireBeforeModelHook, fireBeforeToolSelectionHook, } from './geminiChatHookTriggers.js';
import { coreEvents } from '../utils/events.js';
export var StreamEventType;
(function (StreamEventType) {
    /** A regular content chunk from the API. */
    StreamEventType["CHUNK"] = "chunk";
    /** A signal that a retry is about to happen. The UI should discard any partial
     * content from the attempt that just failed. */
    StreamEventType["RETRY"] = "retry";
    /** A signal that the agent execution has been stopped by a hook. */
    StreamEventType["AGENT_EXECUTION_STOPPED"] = "agent_execution_stopped";
    /** A signal that the agent execution has been blocked by a hook. */
    StreamEventType["AGENT_EXECUTION_BLOCKED"] = "agent_execution_blocked";
})(StreamEventType || (StreamEventType = {}));
const INVALID_CONTENT_RETRY_OPTIONS = {
    maxAttempts: 2, // 1 initial call + 1 retry
    initialDelayMs: 500,
};
export const SYNTHETIC_THOUGHT_SIGNATURE = 'skip_thought_signature_validator';
/**
 * Returns true if the response is valid, false otherwise.
 */
function isValidResponse(response) {
    if (response.candidates === undefined || response.candidates.length === 0) {
        return false;
    }
    const content = response.candidates[0]?.content;
    if (content === undefined) {
        return false;
    }
    return isValidContent(content);
}
export function isValidNonThoughtTextPart(part) {
    return (typeof part.text === 'string' &&
        !part.thought &&
        // Technically, the model should never generate parts that have text and
        //  any of these but we don't trust them so check anyways.
        !part.functionCall &&
        !part.functionResponse &&
        !part.inlineData &&
        !part.fileData);
}
function isValidContent(content) {
    if (content.parts === undefined || content.parts.length === 0) {
        return false;
    }
    for (const part of content.parts) {
        if (part === undefined || Object.keys(part).length === 0) {
            return false;
        }
        if (!part.thought && part.text !== undefined && part.text === '') {
            return false;
        }
    }
    return true;
}
/**
 * Validates the history contains the correct roles.
 *
 * @throws Error if the history does not start with a user turn.
 * @throws Error if the history contains an invalid role.
 */
function validateHistory(history) {
    for (const content of history) {
        if (content.role !== 'user' && content.role !== 'model') {
            throw new Error(`Role must be user or model, but got ${content.role}.`);
        }
    }
}
/**
 * Extracts the curated (valid) history from a comprehensive history.
 *
 * @remarks
 * The model may sometimes generate invalid or empty contents(e.g., due to safety
 * filters or recitation). Extracting valid turns from the history
 * ensures that subsequent requests could be accepted by the model.
 */
function extractCuratedHistory(comprehensiveHistory) {
    if (comprehensiveHistory === undefined || comprehensiveHistory.length === 0) {
        return [];
    }
    const curatedHistory = [];
    const length = comprehensiveHistory.length;
    let i = 0;
    while (i < length) {
        if (comprehensiveHistory[i].role === 'user') {
            curatedHistory.push(comprehensiveHistory[i]);
            i++;
        }
        else {
            const modelOutput = [];
            let isValid = true;
            while (i < length && comprehensiveHistory[i].role === 'model') {
                modelOutput.push(comprehensiveHistory[i]);
                if (isValid && !isValidContent(comprehensiveHistory[i])) {
                    isValid = false;
                }
                i++;
            }
            if (isValid) {
                curatedHistory.push(...modelOutput);
            }
        }
    }
    return curatedHistory;
}
/**
 * Custom error to signal that a stream completed with invalid content,
 * which should trigger a retry.
 */
export class InvalidStreamError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.name = 'InvalidStreamError';
        this.type = type;
    }
}
/**
 * Custom error to signal that agent execution has been stopped.
 */
export class AgentExecutionStoppedError extends Error {
    reason;
    constructor(reason) {
        super(reason);
        this.reason = reason;
        this.name = 'AgentExecutionStoppedError';
    }
}
/**
 * Custom error to signal that agent execution has been blocked.
 */
export class AgentExecutionBlockedError extends Error {
    reason;
    syntheticResponse;
    constructor(reason, syntheticResponse) {
        super(reason);
        this.reason = reason;
        this.syntheticResponse = syntheticResponse;
        this.name = 'AgentExecutionBlockedError';
    }
}
/**
 * Chat session that enables sending messages to the model with previous
 * conversation context.
 *
 * @remarks
 * The session maintains all the turns between user and model.
 */
export class GeminiChat {
    config;
    systemInstruction;
    tools;
    history;
    // A promise to represent the current state of the message being sent to the
    // model.
    sendPromise = Promise.resolve();
    chatRecordingService;
    lastPromptTokenCount;
    constructor(config, systemInstruction = '', tools = [], history = [], resumedSessionData) {
        this.config = config;
        this.systemInstruction = systemInstruction;
        this.tools = tools;
        this.history = history;
        validateHistory(history);
        this.chatRecordingService = new ChatRecordingService(config);
        this.chatRecordingService.initialize(resumedSessionData);
        this.lastPromptTokenCount = estimateTokenCountSync(this.history.flatMap((c) => c.parts || []));
    }
    setSystemInstruction(sysInstr) {
        this.systemInstruction = sysInstr;
    }
    /**
     * Sends a message to the model and returns the response in chunks.
     *
     * @remarks
     * This method will wait for the previous message to be processed before
     * sending the next message.
     *
     * @see {@link Chat#sendMessage} for non-streaming method.
     * @param modelConfigKey - The key for the model config.
     * @param message - The list of messages to send.
     * @param prompt_id - The ID of the prompt.
     * @param signal - An abort signal for this message.
     * @return The model's response.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
     * const response = await chat.sendMessageStream({
     * message: 'Why is the sky blue?'
     * });
     * for await (const chunk of response) {
     * console.log(chunk.text);
     * }
     * ```
     */
    async sendMessageStream(modelConfigKey, message, prompt_id, signal) {
        await this.sendPromise;
        let streamDoneResolver;
        const streamDonePromise = new Promise((resolve) => {
            streamDoneResolver = resolve;
        });
        this.sendPromise = streamDonePromise;
        const userContent = createUserContent(message);
        const { model } = this.config.modelConfigService.getResolvedConfig(modelConfigKey);
        // Record user input - capture complete message with all parts (text, files, images, etc.)
        // but skip recording function responses (tool call results) as they should be stored in tool call records
        if (!isFunctionResponse(userContent)) {
            const userMessage = Array.isArray(message) ? message : [message];
            const userMessageContent = partListUnionToString(toParts(userMessage));
            this.chatRecordingService.recordMessage({
                model,
                type: 'user',
                content: userMessageContent,
            });
        }
        // Add user content to history ONCE before any attempts.
        this.history.push(userContent);
        const requestContents = this.getHistory(true);
        const streamWithRetries = async function* () {
            try {
                let lastError = new Error('Request failed after all retries.');
                const maxAttempts = INVALID_CONTENT_RETRY_OPTIONS.maxAttempts;
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    let isConnectionPhase = true;
                    try {
                        if (attempt > 0) {
                            yield { type: StreamEventType.RETRY };
                        }
                        // If this is a retry, update the key with the new context.
                        const currentConfigKey = attempt > 0
                            ? { ...modelConfigKey, isRetry: true }
                            : modelConfigKey;
                        isConnectionPhase = true;
                        const stream = await this.makeApiCallAndProcessStream(currentConfigKey, requestContents, prompt_id, signal);
                        isConnectionPhase = false;
                        for await (const chunk of stream) {
                            yield { type: StreamEventType.CHUNK, value: chunk };
                        }
                        lastError = null;
                        break;
                    }
                    catch (error) {
                        if (error instanceof AgentExecutionStoppedError) {
                            yield {
                                type: StreamEventType.AGENT_EXECUTION_STOPPED,
                                reason: error.reason,
                            };
                            lastError = null; // Clear error as this is an expected stop
                            return; // Stop the generator
                        }
                        if (error instanceof AgentExecutionBlockedError) {
                            yield {
                                type: StreamEventType.AGENT_EXECUTION_BLOCKED,
                                reason: error.reason,
                            };
                            if (error.syntheticResponse) {
                                yield {
                                    type: StreamEventType.CHUNK,
                                    value: error.syntheticResponse,
                                };
                            }
                            lastError = null; // Clear error as this is an expected stop
                            return; // Stop the generator
                        }
                        if (isConnectionPhase) {
                            throw error;
                        }
                        lastError = error;
                        const isContentError = error instanceof InvalidStreamError;
                        const isRetryable = isRetryableError(error, this.config.getRetryFetchErrors());
                        if ((isContentError && isGemini2Model(model)) ||
                            (isRetryable && !signal.aborted)) {
                            // Check if we have more attempts left.
                            if (attempt < maxAttempts - 1) {
                                const delayMs = INVALID_CONTENT_RETRY_OPTIONS.initialDelayMs;
                                const retryType = isContentError ? error.type : 'NETWORK_ERROR';
                                logContentRetry(this.config, new ContentRetryEvent(attempt, retryType, delayMs, model));
                                coreEvents.emitRetryAttempt({
                                    attempt: attempt + 1,
                                    maxAttempts,
                                    delayMs: delayMs * (attempt + 1),
                                    error: error instanceof Error ? error.message : String(error),
                                    model,
                                });
                                await new Promise((res) => setTimeout(res, delayMs * (attempt + 1)));
                                continue;
                            }
                        }
                        break;
                    }
                }
                if (lastError) {
                    if (lastError instanceof InvalidStreamError &&
                        isGemini2Model(model)) {
                        logContentRetryFailure(this.config, new ContentRetryFailureEvent(maxAttempts, lastError.type, model));
                    }
                    throw lastError;
                }
            }
            finally {
                streamDoneResolver();
            }
        };
        return streamWithRetries.call(this);
    }
    async makeApiCallAndProcessStream(modelConfigKey, requestContents, prompt_id, abortSignal) {
        const contentsForPreviewModel = this.ensureActiveLoopHasThoughtSignatures(requestContents);
        // Track final request parameters for AfterModel hooks
        const { model: availabilityFinalModel, config: newAvailabilityConfig, maxAttempts: availabilityMaxAttempts, } = applyModelSelection(this.config, modelConfigKey);
        let lastModelToUse = availabilityFinalModel;
        let currentGenerateContentConfig = newAvailabilityConfig;
        let lastConfig = currentGenerateContentConfig;
        let lastContentsToUse = requestContents;
        const getAvailabilityContext = createAvailabilityContextProvider(this.config, () => lastModelToUse);
        // Track initial active model to detect fallback changes
        const initialActiveModel = this.config.getActiveModel();
        const apiCall = async () => {
            // Default to the last used model (which respects arguments/availability selection)
            let modelToUse = resolveModel(lastModelToUse, this.config.getPreviewFeatures());
            // If the active model has changed (e.g. due to a fallback updating the config),
            // we switch to the new active model.
            if (this.config.getActiveModel() !== initialActiveModel) {
                modelToUse = resolveModel(this.config.getActiveModel(), this.config.getPreviewFeatures());
            }
            if (modelToUse !== lastModelToUse) {
                const { generateContentConfig: newConfig } = this.config.modelConfigService.getResolvedConfig({
                    ...modelConfigKey,
                    model: modelToUse,
                });
                currentGenerateContentConfig = newConfig;
            }
            lastModelToUse = modelToUse;
            const config = {
                ...currentGenerateContentConfig,
                // TODO(12622): Ensure we don't overrwrite these when they are
                // passed via config.
                systemInstruction: this.systemInstruction,
                tools: this.tools,
                abortSignal,
            };
            let contentsToUse = isPreviewModel(modelToUse)
                ? contentsForPreviewModel
                : requestContents;
            // Fire BeforeModel and BeforeToolSelection hooks if enabled
            const hooksEnabled = this.config.getEnableHooks();
            const messageBus = this.config.getMessageBus();
            if (hooksEnabled && messageBus) {
                // Fire BeforeModel hook
                const beforeModelResult = await fireBeforeModelHook(messageBus, {
                    model: modelToUse,
                    config,
                    contents: contentsToUse,
                });
                // Check if hook requested to stop execution
                if (beforeModelResult.stopped) {
                    throw new AgentExecutionStoppedError(beforeModelResult.reason || 'Agent execution stopped by hook');
                }
                // Check if hook blocked the model call
                if (beforeModelResult.blocked) {
                    // Return a synthetic response generator
                    const syntheticResponse = beforeModelResult.syntheticResponse;
                    if (syntheticResponse) {
                        // Ensure synthetic response has a finish reason to prevent InvalidStreamError
                        if (syntheticResponse.candidates &&
                            syntheticResponse.candidates.length > 0) {
                            for (const candidate of syntheticResponse.candidates) {
                                if (!candidate.finishReason) {
                                    candidate.finishReason = FinishReason.STOP;
                                }
                            }
                        }
                    }
                    throw new AgentExecutionBlockedError(beforeModelResult.reason || 'Model call blocked by hook', syntheticResponse);
                }
                // Apply modifications from BeforeModel hook
                if (beforeModelResult.modifiedConfig) {
                    Object.assign(config, beforeModelResult.modifiedConfig);
                }
                if (beforeModelResult.modifiedContents &&
                    Array.isArray(beforeModelResult.modifiedContents)) {
                    contentsToUse = beforeModelResult.modifiedContents;
                }
                // Fire BeforeToolSelection hook
                const toolSelectionResult = await fireBeforeToolSelectionHook(messageBus, {
                    model: modelToUse,
                    config,
                    contents: contentsToUse,
                });
                // Apply tool configuration modifications
                if (toolSelectionResult.toolConfig) {
                    config.toolConfig = toolSelectionResult.toolConfig;
                }
                if (toolSelectionResult.tools &&
                    Array.isArray(toolSelectionResult.tools)) {
                    config.tools = toolSelectionResult.tools;
                }
            }
            // Track final request parameters for AfterModel hooks
            lastModelToUse = modelToUse;
            lastConfig = config;
            lastContentsToUse = contentsToUse;
            return this.config.getContentGenerator().generateContentStream({
                model: modelToUse,
                contents: contentsToUse,
                config,
            }, prompt_id);
        };
        const onPersistent429Callback = async (authType, error) => handleFallback(this.config, lastModelToUse, authType, error);
        const streamResponse = await retryWithBackoff(apiCall, {
            onPersistent429: onPersistent429Callback,
            authType: this.config.getContentGeneratorConfig()?.authType,
            retryFetchErrors: this.config.getRetryFetchErrors(),
            signal: abortSignal,
            maxAttempts: availabilityMaxAttempts,
            getAvailabilityContext,
            onRetry: (attempt, error, delayMs) => {
                coreEvents.emitRetryAttempt({
                    attempt,
                    maxAttempts: availabilityMaxAttempts ?? 10,
                    delayMs,
                    error: error instanceof Error ? error.message : String(error),
                    model: lastModelToUse,
                });
            },
        });
        // Store the original request for AfterModel hooks
        const originalRequest = {
            model: lastModelToUse,
            config: lastConfig,
            contents: lastContentsToUse,
        };
        return this.processStreamResponse(lastModelToUse, streamResponse, originalRequest);
    }
    /**
     * Returns the chat history.
     *
     * @remarks
     * The history is a list of contents alternating between user and model.
     *
     * There are two types of history:
     * - The `curated history` contains only the valid turns between user and
     * model, which will be included in the subsequent requests sent to the model.
     * - The `comprehensive history` contains all turns, including invalid or
     * empty model outputs, providing a complete record of the history.
     *
     * The history is updated after receiving the response from the model,
     * for streaming response, it means receiving the last chunk of the response.
     *
     * The `comprehensive history` is returned by default. To get the `curated
     * history`, set the `curated` parameter to `true`.
     *
     * @param curated - whether to return the curated history or the comprehensive
     * history.
     * @return History contents alternating between user and model for the entire
     * chat session.
     */
    getHistory(curated = false) {
        const history = curated
            ? extractCuratedHistory(this.history)
            : this.history;
        // Deep copy the history to avoid mutating the history outside of the
        // chat session.
        return structuredClone(history);
    }
    /**
     * Clears the chat history.
     */
    clearHistory() {
        this.history = [];
    }
    /**
     * Adds a new entry to the chat history.
     */
    addHistory(content) {
        this.history.push(content);
    }
    setHistory(history) {
        this.history = history;
    }
    stripThoughtsFromHistory() {
        this.history = this.history.map((content) => {
            const newContent = { ...content };
            if (newContent.parts) {
                newContent.parts = newContent.parts.map((part) => {
                    if (part && typeof part === 'object' && 'thoughtSignature' in part) {
                        const newPart = { ...part };
                        delete newPart.thoughtSignature;
                        return newPart;
                    }
                    return part;
                });
            }
            return newContent;
        });
    }
    // To ensure our requests validate, the first function call in every model
    // turn within the active loop must have a `thoughtSignature` property.
    // If we do not do this, we will get back 400 errors from the API.
    ensureActiveLoopHasThoughtSignatures(requestContents) {
        // First, find the start of the active loop by finding the last user turn
        // with a text message, i.e. that is not a function response.
        let activeLoopStartIndex = -1;
        for (let i = requestContents.length - 1; i >= 0; i--) {
            const content = requestContents[i];
            if (content.role === 'user' && content.parts?.some((part) => part.text)) {
                activeLoopStartIndex = i;
                break;
            }
        }
        if (activeLoopStartIndex === -1) {
            return requestContents;
        }
        // Iterate through every message in the active loop, ensuring that the first
        // function call in each message's list of parts has a valid
        // thoughtSignature property. If it does not we replace the function call
        // with a copy that uses the synthetic thought signature.
        const newContents = requestContents.slice(); // Shallow copy the array
        for (let i = activeLoopStartIndex; i < newContents.length; i++) {
            const content = newContents[i];
            if (content.role === 'model' && content.parts) {
                const newParts = content.parts.slice();
                for (let j = 0; j < newParts.length; j++) {
                    const part = newParts[j];
                    if (part.functionCall) {
                        if (!part.thoughtSignature) {
                            newParts[j] = {
                                ...part,
                                thoughtSignature: SYNTHETIC_THOUGHT_SIGNATURE,
                            };
                            newContents[i] = {
                                ...content,
                                parts: newParts,
                            };
                        }
                        break; // Only consider the first function call
                    }
                }
            }
        }
        return newContents;
    }
    setTools(tools) {
        this.tools = tools;
    }
    async maybeIncludeSchemaDepthContext(error) {
        // Check for potentially problematic cyclic tools with cyclic schemas
        // and include a recommendation to remove potentially problematic tools.
        if (isSchemaDepthError(error.message) ||
            isInvalidArgumentError(error.message)) {
            const tools = this.config.getToolRegistry().getAllTools();
            const cyclicSchemaTools = [];
            for (const tool of tools) {
                if ((tool.schema.parametersJsonSchema &&
                    hasCycleInSchema(tool.schema.parametersJsonSchema)) ||
                    (tool.schema.parameters && hasCycleInSchema(tool.schema.parameters))) {
                    cyclicSchemaTools.push(tool.displayName);
                }
            }
            if (cyclicSchemaTools.length > 0) {
                const extraDetails = `\n\nThis error was probably caused by cyclic schema references in one of the following tools, try disabling them with excludeTools:\n\n - ` +
                    cyclicSchemaTools.join(`\n - `) +
                    `\n`;
                error.message += extraDetails;
            }
        }
    }
    async *processStreamResponse(model, streamResponse, originalRequest) {
        const modelResponseParts = [];
        let hasToolCall = false;
        let finishReason;
        for await (const chunk of streamResponse) {
            const candidateWithReason = chunk?.candidates?.find((candidate) => candidate.finishReason);
            if (candidateWithReason) {
                finishReason = candidateWithReason.finishReason;
            }
            if (isValidResponse(chunk)) {
                const content = chunk.candidates?.[0]?.content;
                if (content?.parts) {
                    if (content.parts.some((part) => part.thought)) {
                        // Record thoughts
                        this.recordThoughtFromContent(content);
                    }
                    if (content.parts.some((part) => part.functionCall)) {
                        hasToolCall = true;
                    }
                    modelResponseParts.push(...content.parts.filter((part) => !part.thought));
                }
            }
            // Record token usage if this chunk has usageMetadata
            if (chunk.usageMetadata) {
                this.chatRecordingService.recordMessageTokens(chunk.usageMetadata);
                if (chunk.usageMetadata.promptTokenCount !== undefined) {
                    this.lastPromptTokenCount = chunk.usageMetadata.promptTokenCount;
                }
            }
            // Fire AfterModel hook through MessageBus (only if hooks are enabled)
            const hooksEnabled = this.config.getEnableHooks();
            const messageBus = this.config.getMessageBus();
            if (hooksEnabled && messageBus && originalRequest && chunk) {
                const hookResult = await fireAfterModelHook(messageBus, originalRequest, chunk);
                if (hookResult.stopped) {
                    throw new AgentExecutionStoppedError(hookResult.reason || 'Agent execution stopped by hook');
                }
                if (hookResult.blocked) {
                    throw new AgentExecutionBlockedError(hookResult.reason || 'Agent execution blocked by hook', hookResult.response);
                }
                yield hookResult.response;
            }
            else {
                yield chunk; // Yield every chunk to the UI immediately.
            }
        }
        // String thoughts and consolidate text parts.
        const consolidatedParts = [];
        for (const part of modelResponseParts) {
            const lastPart = consolidatedParts[consolidatedParts.length - 1];
            if (lastPart?.text &&
                isValidNonThoughtTextPart(lastPart) &&
                isValidNonThoughtTextPart(part)) {
                lastPart.text += part.text;
            }
            else {
                consolidatedParts.push(part);
            }
        }
        const responseText = consolidatedParts
            .filter((part) => part.text)
            .map((part) => part.text)
            .join('')
            .trim();
        // Record model response text from the collected parts
        if (responseText) {
            this.chatRecordingService.recordMessage({
                model,
                type: 'gemini',
                content: responseText,
            });
        }
        // Stream validation logic: A stream is considered successful if:
        // 1. There's a tool call OR
        // 2. A not MALFORMED_FUNCTION_CALL finish reason and a non-mepty resp
        //
        // We throw an error only when there's no tool call AND:
        // - No finish reason, OR
        // - MALFORMED_FUNCTION_CALL finish reason OR
        // - Empty response text (e.g., only thoughts with no actual content)
        if (!hasToolCall) {
            if (!finishReason) {
                throw new InvalidStreamError('Model stream ended without a finish reason.', 'NO_FINISH_REASON');
            }
            if (finishReason === FinishReason.MALFORMED_FUNCTION_CALL) {
                throw new InvalidStreamError('Model stream ended with malformed function call.', 'MALFORMED_FUNCTION_CALL');
            }
            if (!responseText) {
                throw new InvalidStreamError('Model stream ended with empty response text.', 'NO_RESPONSE_TEXT');
            }
        }
        this.history.push({ role: 'model', parts: consolidatedParts });
    }
    getLastPromptTokenCount() {
        return this.lastPromptTokenCount;
    }
    /**
     * Gets the chat recording service instance.
     */
    getChatRecordingService() {
        return this.chatRecordingService;
    }
    /**
     * Records completed tool calls with full metadata.
     * This is called by external components when tool calls complete, before sending responses to Gemini.
     */
    recordCompletedToolCalls(model, toolCalls) {
        const toolCallRecords = toolCalls.map((call) => {
            const resultDisplayRaw = call.response?.resultDisplay;
            const resultDisplay = typeof resultDisplayRaw === 'string' ||
                (typeof resultDisplayRaw === 'object' && resultDisplayRaw !== null)
                ? resultDisplayRaw
                : undefined;
            return {
                id: call.request.callId,
                name: call.request.name,
                args: call.request.args,
                result: call.response?.responseParts || null,
                status: call.status,
                timestamp: new Date().toISOString(),
                resultDisplay,
            };
        });
        this.chatRecordingService.recordToolCalls(model, toolCallRecords);
    }
    /**
     * Extracts and records thought from thought content.
     */
    recordThoughtFromContent(content) {
        if (!content.parts || content.parts.length === 0) {
            return;
        }
        const thoughtPart = content.parts[0];
        if (thoughtPart.text) {
            // Extract subject and description using the same logic as turn.ts
            const rawText = thoughtPart.text;
            const subjectStringMatches = rawText.match(/\*\*(.*?)\*\*/s);
            const subject = subjectStringMatches
                ? subjectStringMatches[1].trim()
                : '';
            const description = rawText.replace(/\*\*(.*?)\*\*/s, '').trim();
            this.chatRecordingService.recordThought({
                subject,
                description,
            });
        }
    }
}
/** Visible for Testing */
export function isSchemaDepthError(errorMessage) {
    return errorMessage.includes('maximum schema depth exceeded');
}
export function isInvalidArgumentError(errorMessage) {
    return errorMessage.includes('Request contains an invalid argument');
}
//# sourceMappingURL=geminiChat.js.map