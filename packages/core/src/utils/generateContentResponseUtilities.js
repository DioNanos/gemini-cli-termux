/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { getResponseText } from './partUtils.js';
import { supportsMultimodalFunctionResponse } from '../config/models.js';
import { debugLogger } from './debugLogger.js';
/**
 * Formats tool output for a Gemini FunctionResponse.
 */
function createFunctionResponsePart(callId, toolName, output) {
    return {
        functionResponse: {
            id: callId,
            name: toolName,
            response: { output },
        },
    };
}
function toParts(input) {
    const parts = [];
    for (const part of Array.isArray(input) ? input : [input]) {
        if (typeof part === 'string') {
            parts.push({ text: part });
        }
        else if (part) {
            parts.push(part);
        }
    }
    return parts;
}
export function convertToFunctionResponse(toolName, callId, llmContent, model) {
    if (typeof llmContent === 'string') {
        return [createFunctionResponsePart(callId, toolName, llmContent)];
    }
    const parts = toParts(llmContent);
    // Separate text from binary types
    const textParts = [];
    const inlineDataParts = [];
    const fileDataParts = [];
    for (const part of parts) {
        if (part.text !== undefined) {
            textParts.push(part.text);
        }
        else if (part.inlineData) {
            inlineDataParts.push(part);
        }
        else if (part.fileData) {
            fileDataParts.push(part);
        }
        else if (part.functionResponse) {
            if (parts.length > 1) {
                debugLogger.warn('convertToFunctionResponse received multiple parts with a functionResponse. Only the functionResponse will be used, other parts will be ignored');
            }
            // Handle passthrough case
            return [
                {
                    functionResponse: {
                        id: callId,
                        name: toolName,
                        response: part.functionResponse.response,
                    },
                },
            ];
        }
        // Ignore other part types
    }
    // Build the primary response part
    const part = {
        functionResponse: {
            id: callId,
            name: toolName,
            response: textParts.length > 0 ? { output: textParts.join('\n') } : {},
        },
    };
    const isMultimodalFRSupported = supportsMultimodalFunctionResponse(model);
    const siblingParts = [...fileDataParts];
    if (inlineDataParts.length > 0) {
        if (isMultimodalFRSupported) {
            // Nest inlineData if supported by the model
            part.functionResponse.parts =
                inlineDataParts;
        }
        else {
            // Otherwise treat as siblings
            siblingParts.push(...inlineDataParts);
        }
    }
    // Add descriptive text if the response object is empty but we have binary content
    if (textParts.length === 0 &&
        (inlineDataParts.length > 0 || fileDataParts.length > 0)) {
        const totalBinaryItems = inlineDataParts.length + fileDataParts.length;
        part.functionResponse.response = {
            output: `Binary content provided (${totalBinaryItems} item(s)).`,
        };
    }
    if (siblingParts.length > 0) {
        return [part, ...siblingParts];
    }
    return [part];
}
export function getResponseTextFromParts(parts) {
    if (!parts) {
        return undefined;
    }
    const textSegments = parts
        .map((part) => part.text)
        .filter((text) => typeof text === 'string');
    if (textSegments.length === 0) {
        return undefined;
    }
    return textSegments.join('');
}
export function getFunctionCalls(response) {
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
        return undefined;
    }
    const functionCallParts = parts
        .filter((part) => !!part.functionCall)
        .map((part) => part.functionCall);
    return functionCallParts.length > 0 ? functionCallParts : undefined;
}
export function getFunctionCallsFromParts(parts) {
    if (!parts) {
        return undefined;
    }
    const functionCallParts = parts
        .filter((part) => !!part.functionCall)
        .map((part) => part.functionCall);
    return functionCallParts.length > 0 ? functionCallParts : undefined;
}
export function getFunctionCallsAsJson(response) {
    const functionCalls = getFunctionCalls(response);
    if (!functionCalls) {
        return undefined;
    }
    return JSON.stringify(functionCalls, null, 2);
}
export function getFunctionCallsFromPartsAsJson(parts) {
    const functionCalls = getFunctionCallsFromParts(parts);
    if (!functionCalls) {
        return undefined;
    }
    return JSON.stringify(functionCalls, null, 2);
}
export function getStructuredResponse(response) {
    const textContent = getResponseText(response);
    const functionCallsJson = getFunctionCallsAsJson(response);
    if (textContent && functionCallsJson) {
        return `${textContent}\n${functionCallsJson}`;
    }
    if (textContent) {
        return textContent;
    }
    if (functionCallsJson) {
        return functionCallsJson;
    }
    return undefined;
}
export function getStructuredResponseFromParts(parts) {
    const textContent = getResponseTextFromParts(parts);
    const functionCallsJson = getFunctionCallsFromPartsAsJson(parts);
    if (textContent && functionCallsJson) {
        return `${textContent}\n${functionCallsJson}`;
    }
    if (textContent) {
        return textContent;
    }
    if (functionCallsJson) {
        return functionCallsJson;
    }
    return undefined;
}
export function getCitations(resp) {
    return (resp.candidates?.[0]?.citationMetadata?.citations ?? [])
        .filter((citation) => citation.uri !== undefined)
        .map((citation) => {
        if (citation.title) {
            return `(${citation.title}) ${citation.uri}`;
        }
        return citation.uri;
    });
}
//# sourceMappingURL=generateContentResponseUtilities.js.map