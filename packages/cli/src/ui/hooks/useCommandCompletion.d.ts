/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Suggestion } from '../components/SuggestionsDisplay.js';
import type { CommandContext, SlashCommand } from '../commands/types.js';
import type { TextBuffer } from '../components/shared/text-buffer.js';
import type { PromptCompletion } from './usePromptCompletion.js';
import type { Config } from '@google/gemini-cli-core';
export declare enum CompletionMode {
    IDLE = "IDLE",
    AT = "AT",
    SLASH = "SLASH",
    PROMPT = "PROMPT"
}
export interface UseCommandCompletionReturn {
    suggestions: Suggestion[];
    activeSuggestionIndex: number;
    visibleStartIndex: number;
    showSuggestions: boolean;
    isLoadingSuggestions: boolean;
    isPerfectMatch: boolean;
    setActiveSuggestionIndex: React.Dispatch<React.SetStateAction<number>>;
    setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
    resetCompletionState: () => void;
    navigateUp: () => void;
    navigateDown: () => void;
    handleAutocomplete: (indexToUse: number) => void;
    promptCompletion: PromptCompletion;
    getCommandFromSuggestion: (suggestion: Suggestion) => SlashCommand | undefined;
    slashCompletionRange: {
        completionStart: number;
        completionEnd: number;
        getCommandFromSuggestion: (suggestion: Suggestion) => SlashCommand | undefined;
        isArgumentCompletion: boolean;
        leafCommand: SlashCommand | null;
    };
    getCompletedText: (suggestion: Suggestion) => string | null;
    completionMode: CompletionMode;
}
export declare function useCommandCompletion(buffer: TextBuffer, cwd: string, slashCommands: readonly SlashCommand[], commandContext: CommandContext, reverseSearchActive: boolean | undefined, shellModeActive: boolean, config?: Config): UseCommandCompletionReturn;
