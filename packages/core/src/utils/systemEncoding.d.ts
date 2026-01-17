/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Reset the encoding cache - useful for testing
 */
export declare function resetEncodingCache(): void;
/**
 * Returns the system encoding, caching the result to avoid repeated system calls.
 * If system encoding detection fails, falls back to detecting from the provided buffer.
 * Note: Only the system encoding is cached - buffer-based detection runs for each buffer
 * since different buffers may have different encodings.
 * @param buffer A buffer to use for detecting encoding if system detection fails.
 */
export declare function getCachedEncodingForBuffer(buffer: Buffer): string;
/**
 * Detects the system encoding based on the platform.
 * For Windows, it uses the 'chcp' command to get the current code page.
 * For Unix-like systems, it checks environment variables like LC_ALL, LC_CTYPE, and LANG.
 * If those are not set, it tries to run 'locale charmap' to get the encoding.
 * If detection fails, it returns null.
 * @returns The system encoding as a string, or null if detection fails.
 */
export declare function getSystemEncoding(): string | null;
/**
 * Converts a Windows code page number to a corresponding encoding name.
 * @param cp The Windows code page number (e.g., 437, 850, etc.)
 * @returns The corresponding encoding name as a string, or null if no mapping exists.
 */
export declare function windowsCodePageToEncoding(cp: number): string | null;
/**
 * Attempts to detect encoding from a buffer using chardet.
 * This is useful when system encoding detection fails.
 * Returns the detected encoding in lowercase, or null if detection fails.
 * @param buffer The buffer to analyze for encoding.
 * @return The detected encoding as a lowercase string, or null if detection fails.
 */
export declare function detectEncodingFromBuffer(buffer: Buffer): string | null;
