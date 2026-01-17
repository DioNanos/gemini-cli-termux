/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
/**
 * Minimum height for the MaxSizedBox component.
 * This ensures there is room for at least one line of content as well as the
 * message that content was truncated.
 */
export declare const MINIMUM_MAX_HEIGHT = 2;
interface MaxSizedBoxProps {
    children?: React.ReactNode;
    maxWidth?: number;
    maxHeight?: number;
    overflowDirection?: 'top' | 'bottom';
    additionalHiddenLinesCount?: number;
}
/**
 * A React component that constrains the size of its children and provides
 * content-aware truncation when the content exceeds the specified `maxHeight`.
 */
export declare const MaxSizedBox: React.FC<MaxSizedBoxProps>;
export {};
