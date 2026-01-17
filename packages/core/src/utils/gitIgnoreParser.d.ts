/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export interface GitIgnoreFilter {
    isIgnored(filePath: string): boolean;
}
export declare class GitIgnoreParser implements GitIgnoreFilter {
    private readonly extraPatterns?;
    private projectRoot;
    private cache;
    private globalPatterns;
    private processedExtraPatterns;
    constructor(projectRoot: string, extraPatterns?: string[] | undefined);
    private loadPatternsForFile;
    private processPatterns;
    isIgnored(filePath: string): boolean;
}
