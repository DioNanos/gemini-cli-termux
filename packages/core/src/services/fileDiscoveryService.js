/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GitIgnoreParser } from '../utils/gitIgnoreParser.js';
import { GeminiIgnoreParser } from '../utils/geminiIgnoreParser.js';
import { isGitRepository } from '../utils/gitUtils.js';
import * as path from 'node:path';
export class FileDiscoveryService {
    gitIgnoreFilter = null;
    geminiIgnoreFilter = null;
    combinedIgnoreFilter = null;
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = path.resolve(projectRoot);
        if (isGitRepository(this.projectRoot)) {
            this.gitIgnoreFilter = new GitIgnoreParser(this.projectRoot);
        }
        this.geminiIgnoreFilter = new GeminiIgnoreParser(this.projectRoot);
        if (this.gitIgnoreFilter) {
            const geminiPatterns = this.geminiIgnoreFilter.getPatterns();
            // Create combined parser: .gitignore + .geminiignore
            this.combinedIgnoreFilter = new GitIgnoreParser(this.projectRoot, geminiPatterns);
        }
    }
    /**
     * Filters a list of file paths based on git ignore rules
     */
    filterFiles(filePaths, options = {}) {
        const { respectGitIgnore = true, respectGeminiIgnore = true } = options;
        return filePaths.filter((filePath) => {
            if (respectGitIgnore &&
                respectGeminiIgnore &&
                this.combinedIgnoreFilter) {
                return !this.combinedIgnoreFilter.isIgnored(filePath);
            }
            if (respectGitIgnore && this.gitIgnoreFilter?.isIgnored(filePath)) {
                return false;
            }
            if (respectGeminiIgnore && this.geminiIgnoreFilter?.isIgnored(filePath)) {
                return false;
            }
            return true;
        });
    }
    /**
     * Filters a list of file paths based on git ignore rules and returns a report
     * with counts of ignored files.
     */
    filterFilesWithReport(filePaths, opts = {
        respectGitIgnore: true,
        respectGeminiIgnore: true,
    }) {
        const filteredPaths = this.filterFiles(filePaths, opts);
        const ignoredCount = filePaths.length - filteredPaths.length;
        return {
            filteredPaths,
            ignoredCount,
        };
    }
    /**
     * Unified method to check if a file should be ignored based on filtering options
     */
    shouldIgnoreFile(filePath, options = {}) {
        return this.filterFiles([filePath], options).length === 0;
    }
}
//# sourceMappingURL=fileDiscoveryService.js.map