/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export function safeJsonStringify(obj, space) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    }, space);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeEmptyObjects(data) {
    const cleanedObject = {};
    for (const k in data) {
        const v = data[k];
        if (v !== null && v !== undefined && typeof v === 'boolean') {
            cleanedObject[k] = v;
        }
    }
    return cleanedObject;
}
/**
 * Safely stringifies an object to JSON, retaining only non-null, Boolean-valued members.
 *
 * @param obj - The object to stringify
 * @returns JSON string with circular references skipped and only non-null, Boolean member values retained.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeJsonStringifyBooleanValuesOnly(obj) {
    let configSeen = false;
    return JSON.stringify(removeEmptyObjects(obj), (key, value) => {
        if (value !== null && !configSeen) {
            configSeen = true;
            return value;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        return '';
    });
}
//# sourceMappingURL=safeJsonStringify.js.map