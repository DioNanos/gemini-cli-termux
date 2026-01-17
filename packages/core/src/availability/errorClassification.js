/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { TerminalQuotaError, RetryableQuotaError, } from '../utils/googleQuotaErrors.js';
import { ModelNotFoundError } from '../utils/httpErrors.js';
export function classifyFailureKind(error) {
    if (error instanceof TerminalQuotaError) {
        return 'terminal';
    }
    if (error instanceof RetryableQuotaError) {
        return 'transient';
    }
    if (error instanceof ModelNotFoundError) {
        return 'not_found';
    }
    return 'unknown';
}
//# sourceMappingURL=errorClassification.js.map