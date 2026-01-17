/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { handleFallback } from '../fallback/handler.js';
import { getResponseText } from '../utils/partUtils.js';
import { reportError } from '../utils/errorReporting.js';
import { getErrorMessage } from '../utils/errors.js';
import { logMalformedJsonResponse } from '../telemetry/loggers.js';
import { MalformedJsonResponseEvent } from '../telemetry/types.js';
import { retryWithBackoff } from '../utils/retry.js';
import { applyModelSelection, createAvailabilityContextProvider, } from '../availability/policyHelpers.js';
const DEFAULT_MAX_ATTEMPTS = 5;
/**
 * A client dedicated to stateless, utility-focused LLM calls.
 */
export class BaseLlmClient {
    contentGenerator;
    config;
    authType;
    constructor(contentGenerator, config, authType) {
        this.contentGenerator = contentGenerator;
        this.config = config;
        this.authType = authType;
    }
    async generateJson(options) {
        const { schema, modelConfigKey, contents, systemInstruction, abortSignal, promptId, maxAttempts, } = options;
        const { model } = this.config.modelConfigService.getResolvedConfig(modelConfigKey);
        const shouldRetryOnContent = (response) => {
            const text = getResponseText(response)?.trim();
            if (!text) {
                return true; // Retry on empty response
            }
            try {
                // We don't use the result, just check if it's valid JSON
                JSON.parse(this.cleanJsonResponse(text, model));
                return false; // It's valid, don't retry
            }
            catch (_e) {
                return true; // It's not valid, retry
            }
        };
        const result = await this._generateWithRetry({
            modelConfigKey,
            contents,
            abortSignal,
            promptId,
            maxAttempts,
            systemInstruction,
            additionalProperties: {
                responseJsonSchema: schema,
                responseMimeType: 'application/json',
            },
        }, shouldRetryOnContent, 'generateJson');
        // If we are here, the content is valid (not empty and parsable).
        return JSON.parse(this.cleanJsonResponse(getResponseText(result).trim(), model));
    }
    async generateEmbedding(texts) {
        if (!texts || texts.length === 0) {
            return [];
        }
        const embedModelParams = {
            model: this.config.getEmbeddingModel(),
            contents: texts,
        };
        const embedContentResponse = await this.contentGenerator.embedContent(embedModelParams);
        if (!embedContentResponse.embeddings ||
            embedContentResponse.embeddings.length === 0) {
            throw new Error('No embeddings found in API response.');
        }
        if (embedContentResponse.embeddings.length !== texts.length) {
            throw new Error(`API returned a mismatched number of embeddings. Expected ${texts.length}, got ${embedContentResponse.embeddings.length}.`);
        }
        return embedContentResponse.embeddings.map((embedding, index) => {
            const values = embedding.values;
            if (!values || values.length === 0) {
                throw new Error(`API returned an empty embedding for input text at index ${index}: "${texts[index]}"`);
            }
            return values;
        });
    }
    cleanJsonResponse(text, model) {
        const prefix = '```json';
        const suffix = '```';
        if (text.startsWith(prefix) && text.endsWith(suffix)) {
            logMalformedJsonResponse(this.config, new MalformedJsonResponseEvent(model));
            return text.substring(prefix.length, text.length - suffix.length).trim();
        }
        return text;
    }
    async generateContent(options) {
        const { modelConfigKey, contents, systemInstruction, abortSignal, promptId, maxAttempts, } = options;
        const shouldRetryOnContent = (response) => {
            const text = getResponseText(response)?.trim();
            return !text; // Retry on empty response
        };
        return this._generateWithRetry({
            modelConfigKey,
            contents,
            systemInstruction,
            abortSignal,
            promptId,
            maxAttempts,
        }, shouldRetryOnContent, 'generateContent');
    }
    async _generateWithRetry(options, shouldRetryOnContent, errorContext) {
        const { modelConfigKey, contents, systemInstruction, abortSignal, promptId, maxAttempts, additionalProperties, } = options;
        const { model, config: generateContentConfig, maxAttempts: availabilityMaxAttempts, } = applyModelSelection(this.config, modelConfigKey);
        let currentModel = model;
        let currentGenerateContentConfig = generateContentConfig;
        // Define callback to fetch context dynamically since active model may get updated during retry loop
        const getAvailabilityContext = createAvailabilityContextProvider(this.config, () => currentModel);
        try {
            const apiCall = () => {
                // Ensure we use the current active model
                // in case a fallback occurred in a previous attempt.
                const activeModel = this.config.getActiveModel();
                if (activeModel !== currentModel) {
                    currentModel = activeModel;
                    // Re-resolve config if model changed during retry
                    const { generateContentConfig } = this.config.modelConfigService.getResolvedConfig({
                        ...modelConfigKey,
                        model: activeModel,
                    });
                    currentGenerateContentConfig = generateContentConfig;
                }
                const finalConfig = {
                    ...currentGenerateContentConfig,
                    ...(systemInstruction && { systemInstruction }),
                    ...additionalProperties,
                    abortSignal,
                };
                const requestParams = {
                    model: currentModel,
                    config: finalConfig,
                    contents,
                };
                return this.contentGenerator.generateContent(requestParams, promptId);
            };
            return await retryWithBackoff(apiCall, {
                shouldRetryOnContent,
                maxAttempts: availabilityMaxAttempts ?? maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
                getAvailabilityContext,
                onPersistent429: this.config.isInteractive()
                    ? (authType, error) => handleFallback(this.config, currentModel, authType, error)
                    : undefined,
                authType: this.authType ?? this.config.getContentGeneratorConfig()?.authType,
            });
        }
        catch (error) {
            if (abortSignal?.aborted) {
                throw error;
            }
            // Check if the error is from exhausting retries, and report accordingly.
            if (error instanceof Error &&
                error.message.includes('Retry attempts exhausted')) {
                await reportError(error, `API returned invalid content after all retries.`, contents, `${errorContext}-invalid-content`);
            }
            else {
                await reportError(error, `Error generating content via API.`, contents, `${errorContext}-api`);
            }
            throw new Error(`Failed to generate content: ${getErrorMessage(error)}`);
        }
    }
}
//# sourceMappingURL=baseLlmClient.js.map