/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SlashCommand } from '../commands/types.js';
/**
 * Checks if a query string potentially represents an '@' command.
 * It triggers if the query starts with '@' or contains '@' preceded by whitespace
 * and followed by a non-whitespace character.
 *
 * @param query The input query string.
 * @returns True if the query looks like an '@' command, false otherwise.
 */
export declare const isAtCommand: (query: string) => boolean;
/**
 * Checks if a query string potentially represents an '/' command.
 * It triggers if the query starts with '/' but excludes code comments like '//' and '/*'.
 *
 * @param query The input query string.
 * @returns True if the query looks like an '/' command, false otherwise.
 */
export declare const isSlashCommand: (query: string) => boolean;
export declare const copyToClipboard: (text: string) => Promise<void>;
export declare const getUrlOpenCommand: () => string;
/**
 * Determines if a slash command should auto-execute when selected.
 *
 * All built-in commands have autoExecute explicitly set to true or false.
 * Custom commands (.toml files) and extension commands without this flag
 * will default to false (safe default - won't auto-execute).
 *
 * @param command The slash command to check
 * @returns true if the command should auto-execute on Enter
 */
export declare function isAutoExecutableCommand(command: SlashCommand | undefined | null): boolean;
