/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageRecord } from './chatRecordingService.js';
import type { BaseLlmClient } from '../core/baseLlmClient.js';
/**
 * Options for generating a session summary.
 */
export interface GenerateSummaryOptions {
    messages: MessageRecord[];
    maxMessages?: number;
    timeout?: number;
}
/**
 * Service for generating AI summaries of chat sessions.
 * Uses Gemini Flash Lite to create concise, user-intent-focused summaries.
 */
export declare class SessionSummaryService {
    private readonly baseLlmClient;
    constructor(baseLlmClient: BaseLlmClient);
    /**
     * Generate a 1-line summary of a chat session focusing on user intent.
     * Returns null if generation fails for any reason.
     */
    generateSummary(options: GenerateSummaryOptions): Promise<string | null>;
}
