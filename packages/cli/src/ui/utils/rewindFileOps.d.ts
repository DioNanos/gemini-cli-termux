/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ConversationRecord, MessageRecord } from '@google/gemini-cli-core';
export interface FileChangeDetail {
    fileName: string;
    diff: string;
}
export interface FileChangeStats {
    addedLines: number;
    removedLines: number;
    fileCount: number;
    details?: FileChangeDetail[];
}
/**
 * Calculates file change statistics for a single turn.
 * A turn is defined as the sequence of messages starting after the given user message
 * and continuing until the next user message or the end of the conversation.
 *
 * @param conversation The full conversation record.
 * @param userMessage The starting user message for the turn.
 * @returns Statistics about lines added/removed and files touched, or null if no edits occurred.
 */
export declare function calculateTurnStats(conversation: ConversationRecord, userMessage: MessageRecord): FileChangeStats | null;
/**
 * Calculates the cumulative file change statistics from a specific message
 * to the end of the conversation.
 *
 * @param conversation The full conversation record.
 * @param userMessage The message to start calculating impact from (exclusive).
 * @returns Aggregate statistics about lines added/removed and files touched, or null if no edits occurred.
 */
export declare function calculateRewindImpact(conversation: ConversationRecord, userMessage: MessageRecord): FileChangeStats | null;
/**
 * Reverts file changes made by the model from the end of the conversation
 * back to a specific target message.
 *
 * It iterates backwards through the conversation history and attempts to undo
 * any file modifications. It handles cases where the user might have subsequently
 * modified the file by attempting a smart patch (using the `diff` library).
 *
 * @param conversation The full conversation record.
 * @param targetMessageId The ID of the message to revert back to. Changes *after* this message will be undone.
 */
export declare function revertFileChanges(conversation: ConversationRecord, targetMessageId: string): Promise<void>;
