/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GenerateContentResponse } from '@google/genai';
export function toCountTokenRequest(req) {
    return {
        request: {
            model: 'models/' + req.model,
            contents: toContents(req.contents),
        },
    };
}
export function fromCountTokenResponse(res) {
    return {
        totalTokens: res.totalTokens,
    };
}
export function toGenerateContentRequest(req, userPromptId, project, sessionId) {
    return {
        model: req.model,
        project,
        user_prompt_id: userPromptId,
        request: toVertexGenerateContentRequest(req, sessionId),
    };
}
export function fromGenerateContentResponse(res) {
    const inres = res.response;
    const out = new GenerateContentResponse();
    out.candidates = inres.candidates;
    out.automaticFunctionCallingHistory = inres.automaticFunctionCallingHistory;
    out.promptFeedback = inres.promptFeedback;
    out.usageMetadata = inres.usageMetadata;
    out.modelVersion = inres.modelVersion;
    out.responseId = res.traceId;
    return out;
}
function toVertexGenerateContentRequest(req, sessionId) {
    return {
        contents: toContents(req.contents),
        systemInstruction: maybeToContent(req.config?.systemInstruction),
        cachedContent: req.config?.cachedContent,
        tools: req.config?.tools,
        toolConfig: req.config?.toolConfig,
        labels: req.config?.labels,
        safetySettings: req.config?.safetySettings,
        generationConfig: toVertexGenerationConfig(req.config),
        session_id: sessionId,
    };
}
export function toContents(contents) {
    if (Array.isArray(contents)) {
        // it's a Content[] or a PartsUnion[]
        return contents.map(toContent);
    }
    // it's a Content or a PartsUnion
    return [toContent(contents)];
}
function maybeToContent(content) {
    if (!content) {
        return undefined;
    }
    return toContent(content);
}
function toContent(content) {
    if (Array.isArray(content)) {
        // it's a PartsUnion[]
        return {
            role: 'user',
            parts: toParts(content),
        };
    }
    if (typeof content === 'string') {
        // it's a string
        return {
            role: 'user',
            parts: [{ text: content }],
        };
    }
    if ('parts' in content) {
        // it's a Content - process parts to handle thought filtering
        return {
            ...content,
            parts: content.parts
                ? toParts(content.parts.filter((p) => p != null))
                : [],
        };
    }
    // it's a Part
    return {
        role: 'user',
        parts: [toPart(content)],
    };
}
export function toParts(parts) {
    return parts.map(toPart);
}
function toPart(part) {
    if (typeof part === 'string') {
        // it's a string
        return { text: part };
    }
    // Handle thought parts for CountToken API compatibility
    // The CountToken API expects parts to have certain required "oneof" fields initialized,
    // but thought parts don't conform to this schema and cause API failures
    if ('thought' in part && part.thought) {
        const thoughtText = `[Thought: ${part.thought}]`;
        const newPart = { ...part };
        delete newPart['thought'];
        const hasApiContent = 'functionCall' in newPart ||
            'functionResponse' in newPart ||
            'inlineData' in newPart ||
            'fileData' in newPart;
        if (hasApiContent) {
            // It's a functionCall or other non-text part. Just strip the thought.
            return newPart;
        }
        // If no other valid API content, this must be a text part.
        // Combine existing text (if any) with the thought, preserving other properties.
        const text = newPart.text;
        const existingText = text ? String(text) : '';
        const combinedText = existingText
            ? `${existingText}\n${thoughtText}`
            : thoughtText;
        return {
            ...newPart,
            text: combinedText,
        };
    }
    return part;
}
function toVertexGenerationConfig(config) {
    if (!config) {
        return undefined;
    }
    return {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        candidateCount: config.candidateCount,
        maxOutputTokens: config.maxOutputTokens,
        stopSequences: config.stopSequences,
        responseLogprobs: config.responseLogprobs,
        logprobs: config.logprobs,
        presencePenalty: config.presencePenalty,
        frequencyPenalty: config.frequencyPenalty,
        seed: config.seed,
        responseMimeType: config.responseMimeType,
        responseSchema: config.responseSchema,
        responseJsonSchema: config.responseJsonSchema,
        routingConfig: config.routingConfig,
        modelSelectionConfig: config.modelSelectionConfig,
        responseModalities: config.responseModalities,
        mediaResolution: config.mediaResolution,
        speechConfig: config.speechConfig,
        audioTimestamp: config.audioTimestamp,
        thinkingConfig: config.thinkingConfig,
    };
}
//# sourceMappingURL=converter.js.map