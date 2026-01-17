/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import stripAnsi from 'strip-ansi';
export class JsonFormatter {
    format(sessionId, response, stats, error) {
        const output = {};
        if (sessionId) {
            output.session_id = sessionId;
        }
        if (response !== undefined) {
            output.response = stripAnsi(response);
        }
        if (stats) {
            output.stats = stats;
        }
        if (error) {
            output.error = error;
        }
        return JSON.stringify(output, null, 2);
    }
    formatError(error, code, sessionId) {
        const jsonError = {
            type: error.constructor.name,
            message: stripAnsi(error.message),
            ...(code && { code }),
        };
        return this.format(sessionId, undefined, undefined, jsonError);
    }
}
//# sourceMappingURL=json-formatter.js.map