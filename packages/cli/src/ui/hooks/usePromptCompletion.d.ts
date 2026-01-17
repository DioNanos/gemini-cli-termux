/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
import type { TextBuffer } from '../components/shared/text-buffer.js';
export declare const PROMPT_COMPLETION_MIN_LENGTH = 5;
export declare const PROMPT_COMPLETION_DEBOUNCE_MS = 250;
export interface PromptCompletion {
    text: string;
    isLoading: boolean;
    isActive: boolean;
    accept: () => void;
    clear: () => void;
    markSelected: (selectedText: string) => void;
}
export interface UsePromptCompletionOptions {
    buffer: TextBuffer;
    config?: Config;
    enabled: boolean;
}
export declare function usePromptCompletion({ buffer, config, enabled, }: UsePromptCompletionOptions): PromptCompletion;
