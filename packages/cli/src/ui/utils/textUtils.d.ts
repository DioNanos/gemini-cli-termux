/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Calculates the maximum width of a multi-line ASCII art string.
 * @param asciiArt The ASCII art string.
 * @returns The length of the longest line in the ASCII art.
 */
export declare const getAsciiArtWidth: (asciiArt: string) => number;
export declare function toCodePoints(str: string): string[];
export declare function cpLen(str: string): number;
export declare function cpSlice(str: string, start: number, end?: number): string;
/**
 * Strip characters that can break terminal rendering.
 *
 * Uses Node.js built-in stripVTControlCharacters to handle VT sequences,
 * then filters remaining control characters that can disrupt display.
 *
 * Characters stripped:
 * - ANSI escape sequences (via strip-ansi)
 * - VT control sequences (via Node.js util.stripVTControlCharacters)
 * - C0 control chars (0x00-0x1F) except CR/LF which are handled elsewhere
 * - C1 control chars (0x80-0x9F) that can cause display issues
 *
 * Characters preserved:
 * - All printable Unicode including emojis
 * - DEL (0x7F) - handled functionally by applyOperations, not a display issue
 * - CR/LF (0x0D/0x0A) - needed for line breaks
 * - TAB (0x09) - preserve tabs
 */
export declare function stripUnsafeCharacters(str: string): string;
/**
 * Cached version of stringWidth function for better performance
 */
export declare const getCachedStringWidth: (str: string) => number;
/**
 * Clear the string width cache
 */
export declare const clearStringWidthCache: () => void;
export declare function escapeAnsiCtrlCodes<T>(obj: T): T;
