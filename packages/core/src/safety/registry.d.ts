/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type InProcessChecker } from './built-in.js';
/**
 * Registry for managing safety checker resolution.
 */
export declare class CheckerRegistry {
    private readonly checkersPath;
    private static readonly BUILT_IN_EXTERNAL_CHECKERS;
    private static readonly BUILT_IN_IN_PROCESS_CHECKERS;
    private static readonly VALID_NAME_PATTERN;
    constructor(checkersPath: string);
    /**
     * Resolves an external checker name to an absolute executable path.
     */
    resolveExternal(name: string): string;
    /**
     * Resolves an in-process checker name to a checker instance.
     */
    resolveInProcess(name: string): InProcessChecker;
    private static isValidCheckerName;
    static getBuiltInCheckers(): string[];
}
