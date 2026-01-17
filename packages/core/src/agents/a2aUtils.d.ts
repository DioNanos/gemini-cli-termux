/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Message, Task, Part } from '@a2a-js/sdk';
/**
 * Extracts a human-readable text representation from a Message object.
 * Handles Text, Data (JSON), and File parts.
 */
export declare function extractMessageText(message: Message | undefined): string;
/**
 * Extracts text from a single Part.
 */
export declare function extractPartText(part: Part): string;
/**
 * Extracts a clean, human-readable text summary from a Task object.
 * Includes the status message and any artifact content with context headers.
 * Technical metadata like ID and State are omitted for better clarity and token efficiency.
 */
export declare function extractTaskText(task: Task): string;
/**
 * Extracts contextId and taskId from a Message or Task response.
 * Follows the pattern from the A2A CLI sample to maintain conversational continuity.
 */
export declare function extractIdsFromResponse(result: Message | Task): {
    contextId?: string;
    taskId?: string;
};
