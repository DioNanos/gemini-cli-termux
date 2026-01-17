/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SafetyCheckInput, SafetyCheckResult } from './protocol.js';
/**
 * Interface for all in-process safety checkers.
 */
export interface InProcessChecker {
    check(input: SafetyCheckInput): Promise<SafetyCheckResult>;
}
/**
 * An in-process checker to validate file paths.
 */
export declare class AllowedPathChecker implements InProcessChecker {
    check(input: SafetyCheckInput): Promise<SafetyCheckResult>;
    private safelyResolvePath;
    private isPathAllowed;
    private collectPathsToCheck;
}
