/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Escapes a string for use in a regular expression.
 */
export declare function escapeRegex(text: string): string;
/**
 * Builds a list of args patterns for policy matching.
 *
 * This function handles the transformation of command prefixes and regexes into
 * the internal argsPattern representation used by the PolicyEngine.
 *
 * @param argsPattern An optional raw regex string for arguments.
 * @param commandPrefix An optional command prefix (or list of prefixes) to allow.
 * @param commandRegex An optional command regex string to allow.
 * @returns An array of string patterns (or undefined) for the PolicyEngine.
 */
export declare function buildArgsPatterns(argsPattern?: string, commandPrefix?: string | string[], commandRegex?: string): Array<string | undefined>;
