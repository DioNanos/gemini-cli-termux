/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GenerateContentResponse, type CountTokensResponse, type GenerateContentParameters, type CountTokensParameters, EmbedContentResponse, type EmbedContentParameters } from '@google/genai';
import type { ContentGenerator } from './contentGenerator.js';
import type { UserTierId } from '../code_assist/types.js';
export type FakeResponse = {
    method: 'generateContent';
    response: GenerateContentResponse;
} | {
    method: 'generateContentStream';
    response: GenerateContentResponse[];
} | {
    method: 'countTokens';
    response: CountTokensResponse;
} | {
    method: 'embedContent';
    response: EmbedContentResponse;
};
export declare class FakeContentGenerator implements ContentGenerator {
    private readonly responses;
    private callCounter;
    userTier?: UserTierId;
    constructor(responses: FakeResponse[]);
    static fromFile(filePath: string): Promise<FakeContentGenerator>;
    private getNextResponse;
    generateContent(request: GenerateContentParameters, _userPromptId: string): Promise<GenerateContentResponse>;
    generateContentStream(request: GenerateContentParameters, _userPromptId: string): Promise<AsyncGenerator<GenerateContentResponse>>;
    countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
}
