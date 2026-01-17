/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config, ResumedSessionData } from '@google/gemini-cli-core';
import type { Part } from '@google/genai';
import type { HistoryItemWithoutId } from '../types.js';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
interface UseSessionResumeParams {
    config: Config;
    historyManager: UseHistoryManagerReturn;
    refreshStatic: () => void;
    isGeminiClientInitialized: boolean;
    setQuittingMessages: (messages: null) => void;
    resumedSessionData?: ResumedSessionData;
    isAuthenticating: boolean;
}
/**
 * Hook to handle session resumption logic.
 * Provides a callback to load history for resume and automatically
 * handles command-line resume on mount.
 */
export declare function useSessionResume({ config, historyManager, refreshStatic, isGeminiClientInitialized, setQuittingMessages, resumedSessionData, isAuthenticating, }: UseSessionResumeParams): {
    loadHistoryForResume: (uiHistory: HistoryItemWithoutId[], clientHistory: Array<{
        role: "user" | "model";
        parts: Part[];
    }>, resumedData: ResumedSessionData) => void;
};
export {};
