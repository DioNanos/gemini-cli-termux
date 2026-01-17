/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Extracts the HTTP status code from an error object.
 * @param error The error object.
 * @returns The HTTP status code, or undefined if not found.
 */
export function getErrorStatus(error) {
    if (typeof error === 'object' && error !== null) {
        if ('status' in error && typeof error.status === 'number') {
            return error.status;
        }
        // Check for error.response.status (common in axios errors)
        if ('response' in error &&
            typeof error.response === 'object' &&
            error.response !== null) {
            const response = error.response;
            if ('status' in response && typeof response.status === 'number') {
                return response.status;
            }
        }
    }
    return undefined;
}
export class ModelNotFoundError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.name = 'ModelNotFoundError';
        this.code = code ? code : 404;
    }
}
//# sourceMappingURL=httpErrors.js.map