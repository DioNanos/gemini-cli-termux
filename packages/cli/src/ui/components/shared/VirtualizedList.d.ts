/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
export declare const SCROLL_TO_ITEM_END: number;
type VirtualizedListProps<T> = {
    data: T[];
    renderItem: (info: {
        item: T;
        index: number;
    }) => React.ReactElement;
    estimatedItemHeight: (index: number) => number;
    keyExtractor: (item: T, index: number) => string;
    initialScrollIndex?: number;
    initialScrollOffsetInIndex?: number;
    scrollbarThumbColor?: string;
};
export type VirtualizedListRef<T> = {
    scrollBy: (delta: number) => void;
    scrollTo: (offset: number) => void;
    scrollToEnd: () => void;
    scrollToIndex: (params: {
        index: number;
        viewOffset?: number;
        viewPosition?: number;
    }) => void;
    scrollToItem: (params: {
        item: T;
        viewOffset?: number;
        viewPosition?: number;
    }) => void;
    getScrollIndex: () => number;
    getScrollState: () => {
        scrollTop: number;
        scrollHeight: number;
        innerHeight: number;
    };
};
declare const VirtualizedListWithForwardRef: <T>(props: VirtualizedListProps<T> & {
    ref?: React.Ref<VirtualizedListRef<T>>;
}) => React.ReactElement;
export { VirtualizedListWithForwardRef as VirtualizedList };
