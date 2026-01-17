/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare function waitFor(assertion: () => void, { timeout, interval }?: {
    timeout?: number | undefined;
    interval?: number | undefined;
}): Promise<void>;
