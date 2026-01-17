/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type PolicyRule, type SafetyCheckerRule } from './types.js';
/**
 * Types of errors that can occur while loading policy files.
 */
export type PolicyFileErrorType = 'file_read' | 'toml_parse' | 'schema_validation' | 'rule_validation' | 'regex_compilation';
/**
 * Detailed error information for policy file loading failures.
 */
export interface PolicyFileError {
    filePath: string;
    fileName: string;
    tier: 'default' | 'user' | 'admin';
    ruleIndex?: number;
    errorType: PolicyFileErrorType;
    message: string;
    details?: string;
    suggestion?: string;
}
/**
 * Result of loading policies from TOML files.
 */
export interface PolicyLoadResult {
    rules: PolicyRule[];
    checkers: SafetyCheckerRule[];
    errors: PolicyFileError[];
}
/**
 * Loads and parses policies from TOML files in the specified directories.
 *
 * This function:
 * 1. Scans directories for .toml files
 * 2. Parses and validates each file
 * 3. Transforms rules (commandPrefix, arrays, mcpName, priorities)
 * 4. Collects detailed error information for any failures
 *
 * @param policyDirs Array of directory paths to scan for policy files
 * @param getPolicyTier Function to determine tier (1-3) for a directory
 * @returns Object containing successfully parsed rules and any errors encountered
 */
export declare function loadPoliciesFromToml(policyDirs: string[], getPolicyTier: (dir: string) => number): Promise<PolicyLoadResult>;
