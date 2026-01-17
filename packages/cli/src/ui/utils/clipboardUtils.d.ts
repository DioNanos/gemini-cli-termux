/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Supported image file extensions based on Gemini API.
 * See: https://ai.google.dev/gemini-api/docs/image-understanding
 */
export declare const IMAGE_EXTENSIONS: string[];
/**
 * Checks if the system clipboard contains an image (macOS and Windows)
 * @returns true if clipboard contains an image
 */
export declare function clipboardHasImage(): Promise<boolean>;
/**
 * Saves the image from clipboard to a temporary file (macOS and Windows)
 * @param targetDir The target directory to create temp files within
 * @returns The path to the saved image file, or null if no image or error
 */
export declare function saveClipboardImage(targetDir?: string): Promise<string | null>;
/**
 * Cleans up old temporary clipboard image files
 * Removes files older than 1 hour
 * @param targetDir The target directory where temp files are stored
 */
export declare function cleanupOldClipboardImages(targetDir?: string): Promise<void>;
/**
 * Splits text into individual path segments, respecting escaped spaces.
 * Unescaped spaces act as separators between paths, while "\ " is preserved
 * as part of a filename.
 *
 * Example: "/img1.png /path/my\ image.png" → ["/img1.png", "/path/my\ image.png"]
 *
 * @param text The text to split
 * @returns Array of path segments (still escaped)
 */
export declare function splitEscapedPaths(text: string): string[];
/**
 * Processes pasted text containing file paths, adding @ prefix to valid paths.
 * Handles both single and multiple space-separated paths.
 *
 * @param text The pasted text (potentially space-separated paths)
 * @param isValidPath Function to validate if a path exists/is valid
 * @returns Processed string with @ prefixes on valid paths, or null if no valid paths
 */
export declare function parsePastedPaths(text: string, isValidPath: (path: string) => boolean): string | null;
