/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import { glob, escape } from 'glob';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from './tools.js';
import { shortenPath, makeRelative } from '../utils/paths.js';
import {} from '../config/config.js';
import { DEFAULT_FILE_FILTERING_OPTIONS } from '../config/constants.js';
import { ToolErrorType } from './tool-error.js';
import { GLOB_TOOL_NAME } from './tool-names.js';
import { getErrorMessage } from '../utils/errors.js';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Sorts file entries based on recency and then alphabetically.
 * Recent files (modified within recencyThresholdMs) are listed first, newest to oldest.
 * Older files are listed after recent ones, sorted alphabetically by path.
 */
export function sortFileEntries(entries, nowTimestamp, recencyThresholdMs) {
    const sortedEntries = [...entries];
    sortedEntries.sort((a, b) => {
        const mtimeA = a.mtimeMs ?? 0;
        const mtimeB = b.mtimeMs ?? 0;
        const aIsRecent = nowTimestamp - mtimeA < recencyThresholdMs;
        const bIsRecent = nowTimestamp - mtimeB < recencyThresholdMs;
        if (aIsRecent && bIsRecent) {
            return mtimeB - mtimeA;
        }
        else if (aIsRecent) {
            return -1;
        }
        else if (bIsRecent) {
            return 1;
        }
        else {
            return a.fullpath().localeCompare(b.fullpath());
        }
    });
    return sortedEntries;
}
class GlobToolInvocation extends BaseToolInvocation {
    config;
    constructor(config, params, messageBus, _toolName, _toolDisplayName) {
        super(params, messageBus, _toolName, _toolDisplayName);
        this.config = config;
    }
    getDescription() {
        let description = `'${this.params.pattern}'`;
        if (this.params.dir_path) {
            const searchDir = path.resolve(this.config.getTargetDir(), this.params.dir_path || '.');
            const relativePath = makeRelative(searchDir, this.config.getTargetDir());
            description += ` within ${shortenPath(relativePath)}`;
        }
        return description;
    }
    async execute(signal) {
        try {
            const workspaceContext = this.config.getWorkspaceContext();
            const workspaceDirectories = workspaceContext.getDirectories();
            // If a specific path is provided, resolve it and check if it's within workspace
            let searchDirectories;
            if (this.params.dir_path) {
                const searchDirAbsolute = path.resolve(this.config.getTargetDir(), this.params.dir_path);
                if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
                    const rawError = `Error: Path "${this.params.dir_path}" is not within any workspace directory`;
                    return {
                        llmContent: rawError,
                        returnDisplay: `Path is not within workspace`,
                        error: {
                            message: rawError,
                            type: ToolErrorType.PATH_NOT_IN_WORKSPACE,
                        },
                    };
                }
                searchDirectories = [searchDirAbsolute];
            }
            else {
                // Search across all workspace directories
                searchDirectories = workspaceDirectories;
            }
            // Get centralized file discovery service
            const fileDiscovery = this.config.getFileService();
            // Collect entries from all search directories
            const allEntries = [];
            for (const searchDir of searchDirectories) {
                let pattern = this.params.pattern;
                const fullPath = path.join(searchDir, pattern);
                if (fs.existsSync(fullPath)) {
                    pattern = escape(pattern);
                }
                const entries = (await glob(pattern, {
                    cwd: searchDir,
                    withFileTypes: true,
                    nodir: true,
                    stat: true,
                    nocase: !this.params.case_sensitive,
                    dot: true,
                    ignore: this.config.getFileExclusions().getGlobExcludes(),
                    follow: false,
                    signal,
                }));
                allEntries.push(...entries);
            }
            const relativePaths = allEntries.map((p) => path.relative(this.config.getTargetDir(), p.fullpath()));
            const { filteredPaths, ignoredCount } = fileDiscovery.filterFilesWithReport(relativePaths, {
                respectGitIgnore: this.params?.respect_git_ignore ??
                    this.config.getFileFilteringOptions().respectGitIgnore ??
                    DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
                respectGeminiIgnore: this.params?.respect_gemini_ignore ??
                    this.config.getFileFilteringOptions().respectGeminiIgnore ??
                    DEFAULT_FILE_FILTERING_OPTIONS.respectGeminiIgnore,
            });
            const filteredAbsolutePaths = new Set(filteredPaths.map((p) => path.resolve(this.config.getTargetDir(), p)));
            const filteredEntries = allEntries.filter((entry) => filteredAbsolutePaths.has(entry.fullpath()));
            if (!filteredEntries || filteredEntries.length === 0) {
                let message = `No files found matching pattern "${this.params.pattern}"`;
                if (searchDirectories.length === 1) {
                    message += ` within ${searchDirectories[0]}`;
                }
                else {
                    message += ` within ${searchDirectories.length} workspace directories`;
                }
                if (ignoredCount > 0) {
                    message += ` (${ignoredCount} files were ignored)`;
                }
                return {
                    llmContent: message,
                    returnDisplay: `No files found`,
                };
            }
            // Set filtering such that we first show the most recent files
            const oneDayInMs = 24 * 60 * 60 * 1000;
            const nowTimestamp = new Date().getTime();
            // Sort the filtered entries using the new helper function
            const sortedEntries = sortFileEntries(filteredEntries, nowTimestamp, oneDayInMs);
            const sortedAbsolutePaths = sortedEntries.map((entry) => entry.fullpath());
            const fileListDescription = sortedAbsolutePaths.join('\n');
            const fileCount = sortedAbsolutePaths.length;
            let resultMessage = `Found ${fileCount} file(s) matching "${this.params.pattern}"`;
            if (searchDirectories.length === 1) {
                resultMessage += ` within ${searchDirectories[0]}`;
            }
            else {
                resultMessage += ` across ${searchDirectories.length} workspace directories`;
            }
            if (ignoredCount > 0) {
                resultMessage += ` (${ignoredCount} additional files were ignored)`;
            }
            resultMessage += `, sorted by modification time (newest first):\n${fileListDescription}`;
            return {
                llmContent: resultMessage,
                returnDisplay: `Found ${fileCount} matching file(s)`,
            };
        }
        catch (error) {
            debugLogger.warn(`GlobLogic execute Error`, error);
            const errorMessage = getErrorMessage(error);
            const rawError = `Error during glob search operation: ${errorMessage}`;
            return {
                llmContent: rawError,
                returnDisplay: `Error: An unexpected error occurred.`,
                error: {
                    message: rawError,
                    type: ToolErrorType.GLOB_EXECUTION_ERROR,
                },
            };
        }
    }
}
/**
 * Implementation of the Glob tool logic
 */
export class GlobTool extends BaseDeclarativeTool {
    config;
    static Name = GLOB_TOOL_NAME;
    constructor(config, messageBus) {
        super(GlobTool.Name, 'FindFiles', 'Efficiently finds files matching specific glob patterns (e.g., `src/**/*.ts`, `**/*.md`), returning absolute paths sorted by modification time (newest first). Ideal for quickly locating files based on their name or path structure, especially in large codebases.', Kind.Search, {
            properties: {
                pattern: {
                    description: "The glob pattern to match against (e.g., '**/*.py', 'docs/*.md').",
                    type: 'string',
                },
                dir_path: {
                    description: 'Optional: The absolute path to the directory to search within. If omitted, searches the root directory.',
                    type: 'string',
                },
                case_sensitive: {
                    description: 'Optional: Whether the search should be case-sensitive. Defaults to false.',
                    type: 'boolean',
                },
                respect_git_ignore: {
                    description: 'Optional: Whether to respect .gitignore patterns when finding files. Only available in git repositories. Defaults to true.',
                    type: 'boolean',
                },
                respect_gemini_ignore: {
                    description: 'Optional: Whether to respect .geminiignore patterns when finding files. Defaults to true.',
                    type: 'boolean',
                },
            },
            required: ['pattern'],
            type: 'object',
        }, messageBus, true, false);
        this.config = config;
    }
    /**
     * Validates the parameters for the tool.
     */
    validateToolParamValues(params) {
        const searchDirAbsolute = path.resolve(this.config.getTargetDir(), params.dir_path || '.');
        const workspaceContext = this.config.getWorkspaceContext();
        if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
            const directories = workspaceContext.getDirectories();
            return `Search path ("${searchDirAbsolute}") resolves outside the allowed workspace directories: ${directories.join(', ')}`;
        }
        const targetDir = searchDirAbsolute || this.config.getTargetDir();
        try {
            if (!fs.existsSync(targetDir)) {
                return `Search path does not exist ${targetDir}`;
            }
            if (!fs.statSync(targetDir).isDirectory()) {
                return `Search path is not a directory: ${targetDir}`;
            }
        }
        catch (e) {
            return `Error accessing search path: ${e}`;
        }
        if (!params.pattern ||
            typeof params.pattern !== 'string' ||
            params.pattern.trim() === '') {
            return "The 'pattern' parameter cannot be empty.";
        }
        return null;
    }
    createInvocation(params, messageBus, _toolName, _toolDisplayName) {
        return new GlobToolInvocation(this.config, params, messageBus, _toolName, _toolDisplayName);
    }
}
//# sourceMappingURL=glob.js.map