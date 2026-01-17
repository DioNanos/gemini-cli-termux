/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Content } from '@google/genai';
/**
 * Generates an error report, writes it to a temporary file, and logs information to user
 * @param error The error object.
 * @param context The relevant context (e.g., chat history, request contents).
 * @param type A string to identify the type of error (e.g., 'startChat', 'generateJson-api').
 * @param baseMessage The initial message to log to console.error before the report path.
 */
export declare function reportError(error: Error | unknown, baseMessage: string, context?: Content[] | Record<string, unknown> | unknown[], type?: string, reportingDir?: string): Promise<void>;
