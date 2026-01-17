/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare function formatWithPrettier(content: string, filePath: string): Promise<string>;
export declare function normalizeForCompare(content: string): string;
export declare function escapeBackticks(value: string): string;
export interface FormatDefaultValueOptions {
    /**
     * When true, string values are JSON-stringified, including surrounding quotes.
     * Defaults to false to return raw string content.
     */
    quoteStrings?: boolean;
}
export declare function formatDefaultValue(value: unknown, options?: FormatDefaultValueOptions): string;
interface MarkerInsertionOptions {
    document: string;
    startMarker: string;
    endMarker: string;
    newContent: string;
    paddingBefore?: string;
    paddingAfter?: string;
}
/**
 * Replaces the content between two markers with `newContent`, preserving the
 * original document outside the markers and applying optional padding.
 */
export declare function injectBetweenMarkers({ document, startMarker, endMarker, newContent, paddingBefore, paddingAfter, }: MarkerInsertionOptions): string;
export {};
