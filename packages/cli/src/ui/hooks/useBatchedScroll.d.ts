/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A hook to manage batched scroll state updates.
 * It allows multiple scroll operations within the same tick to accumulate
 * by keeping track of a 'pending' state that resets after render.
 */
export declare function useBatchedScroll(currentScrollTop: number): {
    getScrollTop: () => number;
    setPendingScrollTop: (newScrollTop: number) => void;
};
