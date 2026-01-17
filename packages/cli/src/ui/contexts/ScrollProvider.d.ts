/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type DOMElement } from 'ink';
export interface ScrollState {
    scrollTop: number;
    scrollHeight: number;
    innerHeight: number;
}
export interface ScrollableEntry {
    id: string;
    ref: React.RefObject<DOMElement>;
    getScrollState: () => ScrollState;
    scrollBy: (delta: number) => void;
    scrollTo?: (scrollTop: number, duration?: number) => void;
    hasFocus: () => boolean;
    flashScrollbar: () => void;
}
export declare const ScrollProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useScrollable: (entry: Omit<ScrollableEntry, "id">, isActive: boolean) => void;
