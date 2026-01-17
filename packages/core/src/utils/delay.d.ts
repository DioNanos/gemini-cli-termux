/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Factory to create a standard abort error for delay helpers.
 */
export declare function createAbortError(): Error;
/**
 * Returns a promise that resolves after the provided duration unless aborted.
 *
 * @param ms Delay duration in milliseconds.
 * @param signal Optional abort signal to cancel the wait early.
 */
export declare function delay(ms: number, signal?: AbortSignal): Promise<void>;
