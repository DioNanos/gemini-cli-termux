/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type BaseLlmClient } from '../core/baseLlmClient.js';
export interface SearchReplaceEdit {
    search: string;
    replace: string;
    noChangesRequired: boolean;
    explanation: string;
}
/**
 * Attempts to fix a failed edit by using an LLM to generate a new search and replace pair.
 * @param instruction The instruction for what needs to be done.
 * @param old_string The original string to be replaced.
 * @param new_string The original replacement string.
 * @param error The error that occurred during the initial edit.
 * @param current_content The current content of the file.
 * @param baseLlmClient The BaseLlmClient to use for the LLM call.
 * @param abortSignal An abort signal to cancel the operation.
 * @param promptId A unique ID for the prompt.
 * @returns A new search and replace pair.
 */
export declare function FixLLMEditWithInstruction(instruction: string, old_string: string, new_string: string, error: string, current_content: string, baseLlmClient: BaseLlmClient, abortSignal: AbortSignal): Promise<SearchReplaceEdit | null>;
export declare function resetLlmEditFixerCaches_TEST_ONLY(): void;
