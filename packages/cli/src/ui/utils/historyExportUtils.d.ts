/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Content } from '@google/genai';
/**
 * Serializes chat history to a Markdown string.
 */
export declare function serializeHistoryToMarkdown(history: Content[]): string;
/**
 * Options for exporting chat history.
 */
export interface ExportHistoryOptions {
    history: Content[];
    filePath: string;
}
/**
 * Exports chat history to a file (JSON or Markdown).
 */
export declare function exportHistoryToFile(options: ExportHistoryOptions): Promise<void>;
