/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GenerateContentResponse, EmbedContentResponse, } from '@google/genai';
import { promises } from 'node:fs';
import { safeJsonStringify } from '../utils/safeJsonStringify.js';
// A ContentGenerator that responds with canned responses.
//
// Typically these would come from a file, provided by the `--fake-responses`
// CLI argument.
export class FakeContentGenerator {
    responses;
    callCounter = 0;
    userTier;
    constructor(responses) {
        this.responses = responses;
    }
    static async fromFile(filePath) {
        const fileContent = await promises.readFile(filePath, 'utf-8');
        const responses = fileContent
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line) => JSON.parse(line));
        return new FakeContentGenerator(responses);
    }
    getNextResponse(method, request) {
        const response = this.responses[this.callCounter++];
        if (!response) {
            throw new Error(`No more mock responses for ${method}, got request:\n` +
                safeJsonStringify(request));
        }
        if (response.method !== method) {
            throw new Error(`Unexpected response type, next response was for ${response.method} but expected ${method}`);
        }
        return response.response;
    }
    async generateContent(request, _userPromptId) {
        return Object.setPrototypeOf(this.getNextResponse('generateContent', request), GenerateContentResponse.prototype);
    }
    async generateContentStream(request, _userPromptId) {
        const responses = this.getNextResponse('generateContentStream', request);
        async function* stream() {
            for (const response of responses) {
                yield Object.setPrototypeOf(response, GenerateContentResponse.prototype);
            }
        }
        return stream();
    }
    async countTokens(request) {
        return this.getNextResponse('countTokens', request);
    }
    async embedContent(request) {
        return Object.setPrototypeOf(this.getNextResponse('embedContent', request), EmbedContentResponse.prototype);
    }
}
//# sourceMappingURL=fakeContentGenerator.js.map