/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Parses an error object to check if it's a structured Google API error
 * and extracts all details.
 *
 * This function can handle two formats:
 * 1. Standard Google API errors where `details` is a top-level field.
 * 2. Errors where the entire structured error object is stringified inside
 *    the `message` field of a wrapper error.
 *
 * @param error The error object to inspect.
 * @returns A GoogleApiError object if the error matches, otherwise null.
 */
export function parseGoogleApiError(error) {
    if (!error) {
        return null;
    }
    let errorObj = error;
    // If error is a string, try to parse it.
    if (typeof errorObj === 'string') {
        try {
            errorObj = JSON.parse(errorObj);
        }
        catch (_) {
            // Not a JSON string, can't parse.
            return null;
        }
    }
    if (Array.isArray(errorObj) && errorObj.length > 0) {
        errorObj = errorObj[0];
    }
    if (typeof errorObj !== 'object' || errorObj === null) {
        return null;
    }
    let currentError = fromGaxiosError(errorObj) ?? fromApiError(errorObj);
    let depth = 0;
    const maxDepth = 10;
    // Handle cases where the actual error object is stringified inside the message
    // by drilling down until we find an error that doesn't have a stringified message.
    while (currentError &&
        typeof currentError.message === 'string' &&
        depth < maxDepth) {
        try {
            const parsedMessage = JSON.parse(currentError.message.replace(/\u00A0/g, '').replace(/\n/g, ' '));
            if (parsedMessage.error) {
                currentError = parsedMessage.error;
                depth++;
            }
            else {
                // The message is a JSON string, but not a nested error object.
                break;
            }
        }
        catch (_error) {
            // It wasn't a JSON string, so we've drilled down as far as we can.
            break;
        }
    }
    if (!currentError) {
        return null;
    }
    const code = currentError.code;
    const message = currentError.message;
    const errorDetails = currentError.details;
    if (code && message) {
        const details = [];
        if (Array.isArray(errorDetails)) {
            for (const detail of errorDetails) {
                if (detail && typeof detail === 'object') {
                    const detailObj = detail;
                    const typeKey = Object.keys(detailObj).find((key) => key.trim() === '@type');
                    if (typeKey) {
                        if (typeKey !== '@type') {
                            detailObj['@type'] = detailObj[typeKey];
                            delete detailObj[typeKey];
                        }
                        // We can just cast it; the consumer will have to switch on @type
                        details.push(detailObj);
                    }
                }
            }
        }
        return {
            code,
            message,
            details,
        };
    }
    return null;
}
function fromGaxiosError(errorObj) {
    const gaxiosError = errorObj;
    let outerError;
    if (gaxiosError.response?.data) {
        let data = gaxiosError.response.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (_) {
                // Not a JSON string, can't parse.
            }
        }
        if (Array.isArray(data) && data.length > 0) {
            data = data[0];
        }
        if (typeof data === 'object' && data !== null) {
            if ('error' in data) {
                outerError = data.error;
            }
        }
    }
    if (!outerError) {
        // If the gaxios structure isn't there, check for a top-level `error` property.
        if (gaxiosError.error) {
            outerError = gaxiosError.error;
        }
        else {
            return undefined;
        }
    }
    return outerError;
}
function fromApiError(errorObj) {
    const apiError = errorObj;
    let outerError;
    if (apiError.message) {
        let data = apiError.message;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (_) {
                // Not a JSON string, can't parse.
                // Try one more fallback: look for the first '{' and last '}'
                if (typeof data === 'string') {
                    const firstBrace = data.indexOf('{');
                    const lastBrace = data.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        try {
                            data = JSON.parse(data.substring(firstBrace, lastBrace + 1));
                        }
                        catch (__) {
                            // Still failed
                        }
                    }
                }
            }
        }
        if (Array.isArray(data) && data.length > 0) {
            data = data[0];
        }
        if (typeof data === 'object' && data !== null) {
            if ('error' in data) {
                outerError = data.error;
            }
        }
    }
    return outerError;
}
//# sourceMappingURL=googleErrors.js.map