/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
export declare function getErrorMessage(error: unknown): string;
/**
 * Handles errors consistently for both JSON and text output formats.
 * In JSON mode, outputs formatted JSON error and exits.
 * In streaming JSON mode, emits a result event with error status.
 * In text mode, outputs error message and re-throws.
 */
export declare function handleError(error: unknown, config: Config, customErrorCode?: string | number): never;
/**
 * Handles tool execution errors specifically.
 *
 * Fatal errors (e.g., NO_SPACE_LEFT) cause the CLI to exit immediately,
 * as they indicate unrecoverable system state.
 *
 * Non-fatal errors (e.g., INVALID_TOOL_PARAMS, FILE_NOT_FOUND, PATH_NOT_IN_WORKSPACE)
 * are logged to stderr and the error response is sent back to the model,
 * allowing it to self-correct.
 */
export declare function handleToolError(toolName: string, toolError: Error, config: Config, errorType?: string, resultDisplay?: string): void;
/**
 * Handles cancellation/abort signals consistently.
 */
export declare function handleCancellationError(config: Config): never;
/**
 * Handles max session turns exceeded consistently.
 */
export declare function handleMaxTurnsExceededError(config: Config): never;
