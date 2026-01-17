/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CountTokensResponse, GenerateContentParameters, GenerateContentResponse, CountTokensParameters, EmbedContentResponse, EmbedContentParameters } from '@google/genai';
import type { ContentGenerator } from './contentGenerator.js';
import type { UserTierId } from '../code_assist/types.js';
export declare class RecordingContentGenerator implements ContentGenerator {
    private readonly realGenerator;
    private readonly filePath;
    userTier?: UserTierId;
    constructor(realGenerator: ContentGenerator, filePath: string);
    generateContent(request: GenerateContentParameters, userPromptId: string): Promise<GenerateContentResponse>;
    generateContentStream(request: GenerateContentParameters, userPromptId: string): Promise<AsyncGenerator<GenerateContentResponse>>;
    countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
}
