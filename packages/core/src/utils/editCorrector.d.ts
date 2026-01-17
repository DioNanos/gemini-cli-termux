/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GeminiClient } from '../core/client.js';
import type { BaseLlmClient } from '../core/baseLlmClient.js';
import type { EditToolParams } from '../tools/edit.js';
/**
 * Defines the structure of the parameters within CorrectedEditResult
 */
interface CorrectedEditParams {
    file_path: string;
    old_string: string;
    new_string: string;
}
/**
 * Defines the result structure for ensureCorrectEdit.
 */
export interface CorrectedEditResult {
    params: CorrectedEditParams;
    occurrences: number;
}
/**
 * Attempts to correct edit parameters if the original old_string is not found.
 * It tries unescaping, and then LLM-based correction.
 * Results are cached to avoid redundant processing.
 *
 * @param currentContent The current content of the file.
 * @param originalParams The original EditToolParams
 * @param client The GeminiClient for LLM calls.
 * @returns A promise resolving to an object containing the (potentially corrected)
 *          EditToolParams (as CorrectedEditParams) and the final occurrences count.
 */
export declare function ensureCorrectEdit(filePath: string, currentContent: string, originalParams: EditToolParams, // This is the EditToolParams from edit.ts, without 'corrected'
geminiClient: GeminiClient, baseLlmClient: BaseLlmClient, abortSignal: AbortSignal, disableLLMCorrection: boolean): Promise<CorrectedEditResult>;
export declare function ensureCorrectFileContent(content: string, baseLlmClient: BaseLlmClient, abortSignal: AbortSignal, disableLLMCorrection?: boolean): Promise<string>;
export declare function correctOldStringMismatch(baseLlmClient: BaseLlmClient, fileContent: string, problematicSnippet: string, abortSignal: AbortSignal): Promise<string>;
/**
 * Adjusts the new_string to align with a corrected old_string, maintaining the original intent.
 */
export declare function correctNewString(baseLlmClient: BaseLlmClient, originalOldString: string, correctedOldString: string, originalNewString: string, abortSignal: AbortSignal): Promise<string>;
export declare function correctNewStringEscaping(baseLlmClient: BaseLlmClient, oldString: string, potentiallyProblematicNewString: string, abortSignal: AbortSignal): Promise<string>;
export declare function correctStringEscaping(potentiallyProblematicString: string, baseLlmClient: BaseLlmClient, abortSignal: AbortSignal): Promise<string>;
/**
 * Unescapes a string that might have been overly escaped by an LLM.
 */
export declare function unescapeStringForGeminiBug(inputString: string): string;
/**
 * Counts occurrences of a substring in a string
 */
export declare function countOccurrences(str: string, substr: string): number;
export declare function resetEditCorrectorCaches_TEST_ONLY(): void;
export {};
