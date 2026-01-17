/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * This file contains functions and types for converting Gemini API request/response
 * formats to the OpenTelemetry semantic conventions for generative AI.
 *
 * @see https://github.com/open-telemetry/semantic-conventions/blob/8b4f210f43136e57c1f6f47292eb6d38e3bf30bb/docs/gen-ai/gen-ai-events.md
 */
import { FinishReason } from '@google/genai';
import { truncateString } from '../utils/textUtils.js';
// 160KB limit for the total size of string content in a log entry.
// The total log entry size limit is 256KB. We leave ~96KB (approx 37%) for JSON overhead (escaping, structure) and other fields.
const GLOBAL_TEXT_LIMIT = 160 * 1024;
function getStringReferences(parts) {
    const refs = [];
    for (const part of parts) {
        if (part instanceof TextPart) {
            refs.push({
                get: () => part.content,
                set: (val) => (part.content = val),
                len: () => part.content.length,
            });
        }
        else if (part instanceof ReasoningPart) {
            refs.push({
                get: () => part.content,
                set: (val) => (part.content = val),
                len: () => part.content.length,
            });
        }
        else if (part instanceof ToolCallRequestPart) {
            if (part.arguments) {
                refs.push({
                    get: () => part.arguments,
                    set: (val) => (part.arguments = val),
                    len: () => part.arguments?.length ?? 0,
                });
            }
        }
        else if (part instanceof ToolCallResponsePart) {
            if (part.response) {
                refs.push({
                    get: () => part.response,
                    set: (val) => (part.response = val),
                    len: () => part.response?.length ?? 0,
                });
            }
        }
        else if (part instanceof GenericPart) {
            if (part.type === 'executableCode' && typeof part['code'] === 'string') {
                refs.push({
                    get: () => part['code'],
                    set: (val) => (part['code'] = val),
                    len: () => part['code'].length,
                });
            }
            else if (part.type === 'codeExecutionResult' &&
                typeof part['output'] === 'string') {
                refs.push({
                    get: () => part['output'],
                    set: (val) => (part['output'] = val),
                    len: () => part['output'].length,
                });
            }
        }
    }
    return refs;
}
function limitTotalLength(parts) {
    const refs = getStringReferences(parts);
    const totalLength = refs.reduce((sum, ref) => sum + ref.len(), 0);
    if (totalLength <= GLOBAL_TEXT_LIMIT) {
        return;
    }
    // Calculate the average budget per part for "large" parts.
    // We identify parts that are larger than the fair share (average) and truncate them.
    const averageSize = GLOBAL_TEXT_LIMIT / refs.length;
    // Filter out parts that are already small enough to not need truncation
    const largeRefs = refs.filter((ref) => ref.len() > averageSize);
    const smallRefsLength = refs
        .filter((ref) => ref.len() <= averageSize)
        .reduce((sum, ref) => sum + ref.len(), 0);
    // Distribute the remaining budget among large parts
    const remainingBudget = GLOBAL_TEXT_LIMIT - smallRefsLength;
    const budgetPerLargePart = Math.max(1, Math.floor(remainingBudget / largeRefs.length));
    for (const ref of largeRefs) {
        const original = ref.get();
        if (original) {
            ref.set(truncateString(original, budgetPerLargePart));
        }
    }
}
export function toInputMessages(contents) {
    const messages = [];
    for (const content of contents) {
        messages.push(toChatMessage(content));
    }
    const allParts = messages.flatMap((m) => m.parts);
    limitTotalLength(allParts);
    return messages;
}
function isPart(value) {
    return (typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !('parts' in value));
}
function toPart(part) {
    if (typeof part === 'string') {
        return { text: part };
    }
    return part;
}
function toContent(content) {
    if (typeof content === 'string') {
        // 1. It's a string
        return {
            parts: [toPart(content)],
        };
    }
    else if (Array.isArray(content)) {
        // 2. It's an array of parts (PartUnion[])
        return {
            parts: content.map(toPart),
        };
    }
    else if ('parts' in content) {
        // 3. It's a Content object
        return content;
    }
    else if (isPart(content)) {
        // 4. It's a single Part object (asserted with type guard)
        return {
            parts: [content],
        };
    }
    else {
        // 5. Handle any other unexpected case
        return undefined;
    }
}
export function toSystemInstruction(systemInstruction) {
    const parts = [];
    if (systemInstruction) {
        const content = toContent(systemInstruction);
        if (content && content.parts) {
            for (const part of content.parts) {
                parts.push(toOTelPart(part));
            }
        }
    }
    limitTotalLength(parts);
    return parts;
}
export function toOutputMessages(candidates) {
    const messages = [];
    if (candidates) {
        for (const candidate of candidates) {
            messages.push({
                finish_reason: toOTelFinishReason(candidate.finishReason),
                ...toChatMessage(candidate.content),
            });
        }
    }
    const allParts = messages.flatMap((m) => m.parts);
    limitTotalLength(allParts);
    return messages;
}
export function toFinishReasons(candidates) {
    const reasons = [];
    if (candidates) {
        for (const candidate of candidates) {
            reasons.push(toOTelFinishReason(candidate.finishReason));
        }
    }
    return reasons;
}
export function toOutputType(requested_mime) {
    switch (requested_mime) {
        // explicitly support the known good values of responseMimeType
        case 'text/plain':
            return OTelOutputType.TEXT;
        case 'application/json':
            return OTelOutputType.JSON;
        default:
            // if none of the well-known values applies, a custom value may be used
            return requested_mime;
    }
}
export function toChatMessage(content) {
    const message = {
        role: undefined,
        parts: [],
    };
    if (content && content.parts) {
        message.role = toOTelRole(content.role);
        for (const part of content.parts) {
            message.parts.push(toOTelPart(part));
        }
    }
    return message;
}
export function toOTelPart(part) {
    if (part.thought) {
        if (part.text) {
            return new ReasoningPart(part.text);
        }
        else {
            return new ReasoningPart('');
        }
    }
    else if (part.text) {
        return new TextPart(part.text);
    }
    else if (part.functionCall) {
        return new ToolCallRequestPart(part.functionCall.name, part.functionCall.id, JSON.stringify(part.functionCall.args));
    }
    else if (part.functionResponse) {
        return new ToolCallResponsePart(JSON.stringify(part.functionResponse.response), part.functionResponse.id);
    }
    else if (part.executableCode) {
        const { executableCode, ...unexpectedData } = part;
        return new GenericPart('executableCode', {
            code: executableCode.code,
            language: executableCode.language,
            ...unexpectedData,
        });
    }
    else if (part.codeExecutionResult) {
        const { codeExecutionResult, ...unexpectedData } = part;
        return new GenericPart('codeExecutionResult', {
            outcome: codeExecutionResult.outcome,
            output: codeExecutionResult.output,
            ...unexpectedData,
        });
    }
    // Assuming the above cases capture all the expected parts
    // but adding a fallthrough just in case.
    return new GenericPart('unknown', { ...part });
}
export var OTelRole;
(function (OTelRole) {
    OTelRole["SYSTEM"] = "system";
    OTelRole["USER"] = "user";
    OTelRole["ASSISTANT"] = "assistant";
    OTelRole["TOOL"] = "tool";
})(OTelRole || (OTelRole = {}));
export function toOTelRole(role) {
    switch (role?.toLowerCase()) {
        case 'system':
            return OTelRole.SYSTEM;
        // Our APIs seem to frequently use 'model'
        case 'model':
            return OTelRole.SYSTEM;
        case 'user':
            return OTelRole.USER;
        case 'assistant':
            return OTelRole.ASSISTANT;
        case 'tool':
            return OTelRole.TOOL;
        default:
            return OTelRole.SYSTEM;
    }
}
export var OTelOutputType;
(function (OTelOutputType) {
    OTelOutputType["IMAGE"] = "image";
    OTelOutputType["JSON"] = "json";
    OTelOutputType["SPEECH"] = "speech";
    OTelOutputType["TEXT"] = "text";
})(OTelOutputType || (OTelOutputType = {}));
export var OTelFinishReason;
(function (OTelFinishReason) {
    OTelFinishReason["STOP"] = "stop";
    OTelFinishReason["LENGTH"] = "length";
    OTelFinishReason["CONTENT_FILTER"] = "content_filter";
    OTelFinishReason["TOOL_CALL"] = "tool_call";
    OTelFinishReason["ERROR"] = "error";
})(OTelFinishReason || (OTelFinishReason = {}));
export function toOTelFinishReason(finishReason) {
    switch (finishReason) {
        // we have significantly more finish reasons than the spec
        case FinishReason.FINISH_REASON_UNSPECIFIED:
            return OTelFinishReason.STOP;
        case FinishReason.STOP:
            return OTelFinishReason.STOP;
        case FinishReason.MAX_TOKENS:
            return OTelFinishReason.LENGTH;
        case FinishReason.SAFETY:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.RECITATION:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.LANGUAGE:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.OTHER:
            return OTelFinishReason.STOP;
        case FinishReason.BLOCKLIST:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.PROHIBITED_CONTENT:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.SPII:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.MALFORMED_FUNCTION_CALL:
            return OTelFinishReason.ERROR;
        case FinishReason.IMAGE_SAFETY:
            return OTelFinishReason.CONTENT_FILTER;
        case FinishReason.UNEXPECTED_TOOL_CALL:
            return OTelFinishReason.ERROR;
        default:
            return OTelFinishReason.STOP;
    }
}
export class TextPart {
    type = 'text';
    content;
    constructor(content) {
        this.content = content;
    }
}
export class ToolCallRequestPart {
    type = 'tool_call';
    name;
    id;
    arguments;
    constructor(name, id, args) {
        this.name = name;
        this.id = id;
        this.arguments = args;
    }
}
export class ToolCallResponsePart {
    type = 'tool_call_response';
    response;
    id;
    constructor(response, id) {
        this.response = response;
        this.id = id;
    }
}
export class ReasoningPart {
    type = 'reasoning';
    content;
    constructor(content) {
        this.content = content;
    }
}
export class GenericPart {
    type;
    constructor(type, data) {
        this.type = type;
        Object.assign(this, data);
    }
}
//# sourceMappingURL=semantic.js.map