/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GoogleApiError } from './googleErrors.js';
/**
 * A non-retryable error indicating a hard quota limit has been reached (e.g., daily limit).
 */
export declare class TerminalQuotaError extends Error {
    readonly cause: GoogleApiError;
    retryDelayMs?: number;
    constructor(message: string, cause: GoogleApiError, retryDelaySeconds?: number);
}
/**
 * A retryable error indicating a temporary quota issue (e.g., per-minute limit).
 */
export declare class RetryableQuotaError extends Error {
    readonly cause: GoogleApiError;
    retryDelayMs?: number;
    constructor(message: string, cause: GoogleApiError, retryDelaySeconds?: number);
}
/**
 * Analyzes a caught error and classifies it as a specific quota-related error if applicable.
 *
 * It decides whether an error is a `TerminalQuotaError` or a `RetryableQuotaError` based on
 * the following logic:
 * - If the error indicates a daily limit, it's a `TerminalQuotaError`.
 * - If the error suggests a retry delay of more than 2 minutes, it's a `TerminalQuotaError`.
 * - If the error suggests a retry delay of 2 minutes or less, it's a `RetryableQuotaError`.
 * - If the error indicates a per-minute limit, it's a `RetryableQuotaError`.
 * - If the error message contains the phrase "Please retry in X[s|ms]", it's a `RetryableQuotaError`.
 *
 * @param error The error to classify.
 * @returns A `TerminalQuotaError`, `RetryableQuotaError`, or the original `unknown` error.
 */
export declare function classifyGoogleError(error: unknown): unknown;
