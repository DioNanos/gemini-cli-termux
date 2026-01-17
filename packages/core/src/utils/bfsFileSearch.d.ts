/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import type { FileFilteringOptions } from '../config/constants.js';
interface BfsFileSearchOptions {
    fileName: string;
    ignoreDirs?: string[];
    maxDirs?: number;
    debug?: boolean;
    fileService?: FileDiscoveryService;
    fileFilteringOptions?: FileFilteringOptions;
}
/**
 * Performs a breadth-first search for a specific file within a directory structure.
 *
 * @param rootDir The directory to start the search from.
 * @param options Configuration for the search.
 * @returns A promise that resolves to an array of paths where the file was found.
 */
export declare function bfsFileSearch(rootDir: string, options: BfsFileSearchOptions): Promise<string[]>;
/**
 * Performs a synchronous breadth-first search for a specific file within a directory structure.
 *
 * @param rootDir The directory to start the search from.
 * @param options Configuration for the search.
 * @returns An array of paths where the file was found.
 */
export declare function bfsFileSearchSync(rootDir: string, options: BfsFileSearchOptions): string[];
export {};
