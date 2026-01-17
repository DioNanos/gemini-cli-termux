/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ConversationRecord, MessageRecord } from '@google/gemini-cli-core';
import { type FileChangeStats } from '../utils/rewindFileOps.js';
export declare function useRewind(conversation: ConversationRecord): {
    selectedMessageId: string | null;
    getStats: (userMessage: MessageRecord) => FileChangeStats | null;
    confirmationStats: FileChangeStats | null;
    selectMessage: (messageId: string) => void;
    clearSelection: () => void;
};
