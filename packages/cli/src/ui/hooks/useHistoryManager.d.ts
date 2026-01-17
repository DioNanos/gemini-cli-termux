/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HistoryItem } from '../types.js';
import type { ChatRecordingService } from '@google/gemini-cli-core/src/services/chatRecordingService.js';
type HistoryItemUpdater = (prevItem: HistoryItem) => Partial<Omit<HistoryItem, 'id'>>;
export interface UseHistoryManagerReturn {
    history: HistoryItem[];
    addItem: (itemData: Omit<HistoryItem, 'id'>, baseTimestamp?: number, isResuming?: boolean) => number;
    updateItem: (id: number, updates: Partial<Omit<HistoryItem, 'id'>> | HistoryItemUpdater) => void;
    clearItems: () => void;
    loadHistory: (newHistory: HistoryItem[]) => void;
}
/**
 * Custom hook to manage the chat history state.
 *
 * Encapsulates the history array, message ID generation, adding items,
 * updating items, and clearing the history.
 */
export declare function useHistory({ chatRecordingService, }?: {
    chatRecordingService?: ChatRecordingService | null;
}): UseHistoryManagerReturn;
export {};
