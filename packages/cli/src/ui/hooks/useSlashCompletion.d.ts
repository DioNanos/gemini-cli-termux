/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Suggestion } from '../components/SuggestionsDisplay.js';
import { type CommandContext, type SlashCommand } from '../commands/types.js';
export interface UseSlashCompletionProps {
    enabled: boolean;
    query: string | null;
    slashCommands: readonly SlashCommand[];
    commandContext: CommandContext;
    setSuggestions: (suggestions: Suggestion[]) => void;
    setIsLoadingSuggestions: (isLoading: boolean) => void;
    setIsPerfectMatch: (isMatch: boolean) => void;
}
export declare function useSlashCompletion(props: UseSlashCompletionProps): {
    completionStart: number;
    completionEnd: number;
    getCommandFromSuggestion: (suggestion: Suggestion) => SlashCommand | undefined;
    isArgumentCompletion: boolean;
    leafCommand: SlashCommand | null;
};
