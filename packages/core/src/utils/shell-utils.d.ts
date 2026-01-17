/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type SpawnOptionsWithoutStdio } from 'node:child_process';
export declare const SHELL_TOOL_NAMES: string[];
/**
 * An identifier for the shell type.
 */
export type ShellType = 'cmd' | 'powershell' | 'bash';
/**
 * Defines the configuration required to execute a command string within a specific shell.
 */
export interface ShellConfiguration {
    /** The path or name of the shell executable (e.g., 'bash', 'powershell.exe'). */
    executable: string;
    /**
     * The arguments required by the shell to execute a subsequent string argument.
     */
    argsPrefix: string[];
    /** An identifier for the shell type. */
    shell: ShellType;
}
export declare function resolveExecutable(exe: string): Promise<string | undefined>;
export declare function initializeShellParsers(): Promise<void>;
export interface ParsedCommandDetail {
    name: string;
    text: string;
}
interface CommandParseResult {
    details: ParsedCommandDetail[];
    hasError: boolean;
    hasRedirection?: boolean;
}
export declare function parseCommandDetails(command: string): CommandParseResult | null;
/**
 * Determines the appropriate shell configuration for the current platform.
 *
 * This ensures we can execute command strings predictably and securely across platforms
 * using the `spawn(executable, [...argsPrefix, commandString], { shell: false })` pattern.
 *
 * @returns The ShellConfiguration for the current environment.
 */
export declare function getShellConfiguration(): ShellConfiguration;
/**
 * Export the platform detection constant for use in process management (e.g., killing processes).
 */
export declare const isWindows: () => boolean;
/**
 * Escapes a string so that it can be safely used as a single argument
 * in a shell command, preventing command injection.
 *
 * @param arg The argument string to escape.
 * @param shell The type of shell the argument is for.
 * @returns The shell-escaped string.
 */
export declare function escapeShellArg(arg: string, shell: ShellType): string;
/**
 * Splits a shell command into a list of individual commands, respecting quotes.
 * This is used to separate chained commands (e.g., using &&, ||, ;).
 * @param command The shell command string to parse
 * @returns An array of individual command strings
 */
/**
 * Checks if a command contains redirection operators.
 * Uses shell-specific parsers where possible, falling back to a broad regex check.
 */
export declare function hasRedirection(command: string): boolean;
export declare function splitCommands(command: string): string[];
/**
 * Extracts the root command from a given shell command string.
 * This is used to identify the base command for permission checks.
 * @param command The shell command string to parse
 * @returns The root command name, or undefined if it cannot be determined
 * @example getCommandRoot("ls -la /tmp") returns "ls"
 * @example getCommandRoot("git status && npm test") returns "git"
 */
export declare function getCommandRoot(command: string): string | undefined;
export declare function getCommandRoots(command: string): string[];
export declare function stripShellWrapper(command: string): string;
/**
 * Detects command substitution patterns in a shell command, following bash quoting rules:
 * - Single quotes ('): Everything literal, no substitution possible
 * - Double quotes ("): Command substitution with $() and backticks unless escaped with \
 * - No quotes: Command substitution with $(), <(), and backticks
 * @param command The shell command string to check
 * @returns true if command substitution would be executed by bash
 */
/**
 * Determines whether a given shell command is allowed to execute based on
 * the tool's configuration including allowlists and blocklists.
 *
 * This function operates in "default allow" mode. It is a wrapper around
 * `checkCommandPermissions`.
 *
 * @param command The shell command string to validate.
 * @param config The application configuration.
 * @returns An object with 'allowed' boolean and optional 'reason' string if not allowed.
 */
export declare const spawnAsync: (command: string, args: string[], options?: SpawnOptionsWithoutStdio) => Promise<{
    stdout: string;
    stderr: string;
}>;
export {};
