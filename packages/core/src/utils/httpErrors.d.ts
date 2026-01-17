/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export interface HttpError extends Error {
    status?: number;
}
/**
 * Extracts the HTTP status code from an error object.
 * @param error The error object.
 * @returns The HTTP status code, or undefined if not found.
 */
export declare function getErrorStatus(error: unknown): number | undefined;
export declare class ModelNotFoundError extends Error {
    code: number;
    constructor(message: string, code?: number);
}
