/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export interface GeminiIgnoreFilter {
    isIgnored(filePath: string): boolean;
    getPatterns(): string[];
    getIgnoreFilePath(): string | null;
    hasPatterns(): boolean;
}
export declare class GeminiIgnoreParser implements GeminiIgnoreFilter {
    private projectRoot;
    private patterns;
    private ig;
    constructor(projectRoot: string);
    private loadPatterns;
    isIgnored(filePath: string): boolean;
    getPatterns(): string[];
    /**
     * Returns the path to .geminiignore file if it exists and has patterns.
     * Useful for tools like ripgrep that support --ignore-file flag.
     */
    getIgnoreFilePath(): string | null;
    /**
     * Returns true if .geminiignore exists and has patterns.
     */
    hasPatterns(): boolean;
}
