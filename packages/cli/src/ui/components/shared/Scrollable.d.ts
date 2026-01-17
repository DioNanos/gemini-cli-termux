/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
interface ScrollableProps {
    children?: React.ReactNode;
    width?: number;
    height?: number | string;
    maxWidth?: number;
    maxHeight?: number;
    hasFocus: boolean;
    scrollToBottom?: boolean;
    flexGrow?: number;
}
export declare const Scrollable: React.FC<ScrollableProps>;
export {};
