/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HistoryItemWithoutId } from '../types.js';
import type { Config, ConversationRecord, ResumedSessionData } from '@google/gemini-cli-core';
import type { Part } from '@google/genai';
import type { SessionInfo } from '../../utils/sessionUtils.js';
export declare const useSessionBrowser: (config: Config, onLoadHistory: (uiHistory: HistoryItemWithoutId[], clientHistory: Array<{
    role: "user" | "model";
    parts: Part[];
}>, resumedSessionData: ResumedSessionData) => void) => {
    isSessionBrowserOpen: boolean;
    openSessionBrowser: () => void;
    closeSessionBrowser: () => void;
    /**
     * Loads a conversation by ID, and reinitializes the chat recording service with it.
     */
    handleResumeSession: (session: SessionInfo) => Promise<void>;
    /**
     * Deletes a session by ID using the ChatRecordingService.
     */
    handleDeleteSession: (session: SessionInfo) => void;
};
/**
 * Converts session/conversation data into UI history and Gemini client history formats.
 */
export declare function convertSessionToHistoryFormats(messages: ConversationRecord['messages']): {
    uiHistory: HistoryItemWithoutId[];
    clientHistory: Array<{
        role: 'user' | 'model';
        parts: Part[];
    }>;
};
