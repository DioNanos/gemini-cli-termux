/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type VirtualizedListRef } from './VirtualizedList.js';
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
};
interface ScrollableListProps<T> extends VirtualizedListProps<T> {
    hasFocus: boolean;
}
export type ScrollableListRef<T> = VirtualizedListRef<T>;
declare const ScrollableListWithForwardRef: <T>(props: ScrollableListProps<T> & {
    ref?: React.Ref<ScrollableListRef<T>>;
}) => React.ReactElement;
export { ScrollableListWithForwardRef as ScrollableList };
