/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export interface FilterFilesOptions {
    respectGitIgnore?: boolean;
    respectGeminiIgnore?: boolean;
}
export interface FilterReport {
    filteredPaths: string[];
    ignoredCount: number;
}
export declare class FileDiscoveryService {
    private gitIgnoreFilter;
    private geminiIgnoreFilter;
    private combinedIgnoreFilter;
    private projectRoot;
    constructor(projectRoot: string);
    /**
     * Filters a list of file paths based on git ignore rules
     */
    filterFiles(filePaths: string[], options?: FilterFilesOptions): string[];
    /**
     * Filters a list of file paths based on git ignore rules and returns a report
     * with counts of ignored files.
     */
    filterFilesWithReport(filePaths: string[], opts?: FilterFilesOptions): FilterReport;
    /**
     * Unified method to check if a file should be ignored based on filtering options
     */
    shouldIgnoreFile(filePath: string, options?: FilterFilesOptions): boolean;
}
