/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare function expandHomeDir(p: string): string;
/**
 * Gets directory suggestions based on a partial path.
 * Uses async iteration with fs.opendir for efficient handling of large directories.
 *
 * @param partialPath The partial path typed by the user.
 * @returns A promise resolving to an array of directory path suggestions.
 */
export declare function getDirectorySuggestions(partialPath: string): Promise<string[]>;
