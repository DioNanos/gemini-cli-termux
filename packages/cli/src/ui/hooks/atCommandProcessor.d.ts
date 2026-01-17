/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PartListUnion } from '@google/genai';
import type { Config } from '@google/gemini-cli-core';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
interface HandleAtCommandParams {
    query: string;
    config: Config;
    addItem: UseHistoryManagerReturn['addItem'];
    onDebugMessage: (message: string) => void;
    messageId: number;
    signal: AbortSignal;
}
interface HandleAtCommandResult {
    processedQuery: PartListUnion | null;
    error?: string;
}
/**
 * Processes user input containing one or more '@<path>' commands.
 * - Workspace paths are read via the 'read_many_files' tool.
 * - MCP resource URIs are read via each server's `resources/read`.
 * The user query is updated with inline content blocks so the LLM receives the
 * referenced context directly.
 *
 * @returns An object indicating whether the main hook should proceed with an
 *          LLM call and the processed query parts (including file/resource content).
 */
export declare function handleAtCommand({ query, config, addItem, onDebugMessage, messageId: userMessageTimestamp, signal, }: HandleAtCommandParams): Promise<HandleAtCommandResult>;
export {};
