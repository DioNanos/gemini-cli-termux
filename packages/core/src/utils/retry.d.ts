/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentResponse } from '@google/genai';
import type { RetryAvailabilityContext } from '../availability/modelPolicy.js';
export type { RetryAvailabilityContext };
export interface RetryOptions {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    shouldRetryOnError: (error: Error, retryFetchErrors?: boolean) => boolean;
    shouldRetryOnContent?: (content: GenerateContentResponse) => boolean;
    onPersistent429?: (authType?: string, error?: unknown) => Promise<string | boolean | null>;
    authType?: string;
    retryFetchErrors?: boolean;
    signal?: AbortSignal;
    getAvailabilityContext?: () => RetryAvailabilityContext | undefined;
    onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}
/**
 * Default predicate function to determine if a retry should be attempted.
 * Retries on 429 (Too Many Requests) and 5xx server errors.
 * @param error The error object.
 * @param retryFetchErrors Whether to retry on specific fetch errors.
 * @returns True if the error is a transient error, false otherwise.
 */
export declare function isRetryableError(error: Error | unknown, retryFetchErrors?: boolean): boolean;
/**
 * Retries a function with exponential backoff and jitter.
 * @param fn The asynchronous function to retry.
 * @param options Optional retry configuration.
 * @returns A promise that resolves with the result of the function if successful.
 * @throws The last error encountered if all attempts fail.
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
