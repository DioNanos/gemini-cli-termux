import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useLayoutEffect, forwardRef, useImperativeHandle, useEffect, useMemo, useCallback, } from 'react';
import { theme } from '../../semantic-colors.js';
import { useBatchedScroll } from '../../hooks/useBatchedScroll.js';
import { measureElement, Box } from 'ink';
export const SCROLL_TO_ITEM_END = Number.MAX_SAFE_INTEGER;
function findLastIndex(array, predicate) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}
function VirtualizedList(props, ref) {
    const { data, renderItem, estimatedItemHeight, keyExtractor, initialScrollIndex, initialScrollOffsetInIndex, } = props;
    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);
    const [scrollAnchor, setScrollAnchor] = useState(() => {
        const scrollToEnd = initialScrollIndex === SCROLL_TO_ITEM_END ||
            (typeof initialScrollIndex === 'number' &&
                initialScrollIndex >= data.length - 1 &&
                initialScrollOffsetInIndex === SCROLL_TO_ITEM_END);
        if (scrollToEnd) {
            return {
                index: data.length > 0 ? data.length - 1 : 0,
                offset: SCROLL_TO_ITEM_END,
            };
        }
        if (typeof initialScrollIndex === 'number') {
            return {
                index: Math.max(0, Math.min(data.length - 1, initialScrollIndex)),
                offset: initialScrollOffsetInIndex ?? 0,
            };
        }
        return { index: 0, offset: 0 };
    });
    const [isStickingToBottom, setIsStickingToBottom] = useState(() => {
        const scrollToEnd = initialScrollIndex === SCROLL_TO_ITEM_END ||
            (typeof initialScrollIndex === 'number' &&
                initialScrollIndex >= data.length - 1 &&
                initialScrollOffsetInIndex === SCROLL_TO_ITEM_END);
        return scrollToEnd;
    });
    const containerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const itemRefs = useRef([]);
    const [heights, setHeights] = useState([]);
    const isInitialScrollSet = useRef(false);
    const { totalHeight, offsets } = useMemo(() => {
        const offsets = [0];
        let totalHeight = 0;
        for (let i = 0; i < data.length; i++) {
            const height = heights[i] ?? estimatedItemHeight(i);
            totalHeight += height;
            offsets.push(totalHeight);
        }
        return { totalHeight, offsets };
    }, [heights, data, estimatedItemHeight]);
    useEffect(() => {
        setHeights((prevHeights) => {
            if (data.length === prevHeights.length) {
                return prevHeights;
            }
            const newHeights = [...prevHeights];
            if (data.length < prevHeights.length) {
                newHeights.length = data.length;
            }
            else {
                for (let i = prevHeights.length; i < data.length; i++) {
                    newHeights[i] = estimatedItemHeight(i);
                }
            }
            return newHeights;
        });
    }, [data, estimatedItemHeight]);
    // This layout effect needs to run on every render to correctly measure the
    // container and ensure we recompute the layout if it has changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
        if (containerRef.current) {
            const height = Math.round(measureElement(containerRef.current).height);
            if (containerHeight !== height) {
                setContainerHeight(height);
            }
        }
        let newHeights = null;
        for (let i = startIndex; i <= endIndex; i++) {
            const itemRef = itemRefs.current[i];
            if (itemRef) {
                const height = Math.round(measureElement(itemRef).height);
                if (height !== heights[i]) {
                    if (!newHeights) {
                        newHeights = [...heights];
                    }
                    newHeights[i] = height;
                }
            }
        }
        if (newHeights) {
            setHeights(newHeights);
        }
    });
    const scrollableContainerHeight = containerRef.current
        ? Math.round(measureElement(containerRef.current).height)
        : containerHeight;
    const getAnchorForScrollTop = useCallback((scrollTop, offsets) => {
        const index = findLastIndex(offsets, (offset) => offset <= scrollTop);
        if (index === -1) {
            return { index: 0, offset: 0 };
        }
        return { index, offset: scrollTop - offsets[index] };
    }, []);
    const scrollTop = useMemo(() => {
        const offset = offsets[scrollAnchor.index];
        if (typeof offset !== 'number') {
            return 0;
        }
        if (scrollAnchor.offset === SCROLL_TO_ITEM_END) {
            const itemHeight = heights[scrollAnchor.index] ?? 0;
            return offset + itemHeight - scrollableContainerHeight;
        }
        return offset + scrollAnchor.offset;
    }, [scrollAnchor, offsets, heights, scrollableContainerHeight]);
    const prevDataLength = useRef(data.length);
    const prevTotalHeight = useRef(totalHeight);
    const prevScrollTop = useRef(scrollTop);
    const prevContainerHeight = useRef(scrollableContainerHeight);
    useLayoutEffect(() => {
        const contentPreviouslyFit = prevTotalHeight.current <= prevContainerHeight.current;
        const wasScrolledToBottomPixels = prevScrollTop.current >=
            prevTotalHeight.current - prevContainerHeight.current - 1;
        const wasAtBottom = contentPreviouslyFit || wasScrolledToBottomPixels;
        // If the user was at the bottom, they are now sticking. This handles
        // manually scrolling back to the bottom.
        if (wasAtBottom && scrollTop >= prevScrollTop.current) {
            setIsStickingToBottom(true);
        }
        const listGrew = data.length > prevDataLength.current;
        const containerChanged = prevContainerHeight.current !== scrollableContainerHeight;
        // We scroll to the end if:
        // 1. The list grew AND we were already at the bottom (or sticking).
        // 2. We are sticking to the bottom AND the container size changed.
        if ((listGrew && (isStickingToBottom || wasAtBottom)) ||
            (isStickingToBottom && containerChanged)) {
            setScrollAnchor({
                index: data.length > 0 ? data.length - 1 : 0,
                offset: SCROLL_TO_ITEM_END,
            });
            // If we are scrolling to the bottom, we are by definition sticking.
            if (!isStickingToBottom) {
                setIsStickingToBottom(true);
            }
        }
        // Scenario 2: The list has changed (shrunk) in a way that our
        // current scroll position or anchor is invalid. We should adjust to the bottom.
        else if ((scrollAnchor.index >= data.length ||
            scrollTop > totalHeight - scrollableContainerHeight) &&
            data.length > 0) {
            const newScrollTop = Math.max(0, totalHeight - scrollableContainerHeight);
            setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
        }
        else if (data.length === 0) {
            // List is now empty, reset scroll to top.
            setScrollAnchor({ index: 0, offset: 0 });
        }
        // Update refs for the next render cycle.
        prevDataLength.current = data.length;
        prevTotalHeight.current = totalHeight;
        prevScrollTop.current = scrollTop;
        prevContainerHeight.current = scrollableContainerHeight;
    }, [
        data.length,
        totalHeight,
        scrollTop,
        scrollableContainerHeight,
        scrollAnchor.index,
        getAnchorForScrollTop,
        offsets,
        isStickingToBottom,
    ]);
    useLayoutEffect(() => {
        if (isInitialScrollSet.current ||
            offsets.length <= 1 ||
            totalHeight <= 0 ||
            containerHeight <= 0) {
            return;
        }
        if (typeof initialScrollIndex === 'number') {
            const scrollToEnd = initialScrollIndex === SCROLL_TO_ITEM_END ||
                (initialScrollIndex >= data.length - 1 &&
                    initialScrollOffsetInIndex === SCROLL_TO_ITEM_END);
            if (scrollToEnd) {
                setScrollAnchor({
                    index: data.length - 1,
                    offset: SCROLL_TO_ITEM_END,
                });
                setIsStickingToBottom(true);
                isInitialScrollSet.current = true;
                return;
            }
            const index = Math.max(0, Math.min(data.length - 1, initialScrollIndex));
            const offset = initialScrollOffsetInIndex ?? 0;
            const newScrollTop = (offsets[index] ?? 0) + offset;
            const clampedScrollTop = Math.max(0, Math.min(totalHeight - scrollableContainerHeight, newScrollTop));
            setScrollAnchor(getAnchorForScrollTop(clampedScrollTop, offsets));
            isInitialScrollSet.current = true;
        }
    }, [
        initialScrollIndex,
        initialScrollOffsetInIndex,
        offsets,
        totalHeight,
        containerHeight,
        getAnchorForScrollTop,
        data.length,
        heights,
        scrollableContainerHeight,
    ]);
    const startIndex = Math.max(0, findLastIndex(offsets, (offset) => offset <= scrollTop) - 1);
    const endIndexOffset = offsets.findIndex((offset) => offset > scrollTop + scrollableContainerHeight);
    const endIndex = endIndexOffset === -1
        ? data.length - 1
        : Math.min(data.length - 1, endIndexOffset);
    const topSpacerHeight = offsets[startIndex] ?? 0;
    const bottomSpacerHeight = totalHeight - (offsets[endIndex + 1] ?? totalHeight);
    const renderedItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
        const item = data[i];
        if (item) {
            renderedItems.push(_jsx(Box, { width: "100%", ref: (el) => {
                    itemRefs.current[i] = el;
                }, children: renderItem({ item, index: i }) }, keyExtractor(item, i)));
        }
    }
    const { getScrollTop, setPendingScrollTop } = useBatchedScroll(scrollTop);
    useImperativeHandle(ref, () => ({
        scrollBy: (delta) => {
            if (delta < 0) {
                setIsStickingToBottom(false);
            }
            const currentScrollTop = getScrollTop();
            const newScrollTop = Math.max(0, Math.min(totalHeight - scrollableContainerHeight, currentScrollTop + delta));
            setPendingScrollTop(newScrollTop);
            setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
        },
        scrollTo: (offset) => {
            setIsStickingToBottom(false);
            const newScrollTop = Math.max(0, Math.min(totalHeight - scrollableContainerHeight, offset));
            setPendingScrollTop(newScrollTop);
            setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
        },
        scrollToEnd: () => {
            setIsStickingToBottom(true);
            if (data.length > 0) {
                setScrollAnchor({
                    index: data.length - 1,
                    offset: SCROLL_TO_ITEM_END,
                });
            }
        },
        scrollToIndex: ({ index, viewOffset = 0, viewPosition = 0, }) => {
            setIsStickingToBottom(false);
            const offset = offsets[index];
            if (offset !== undefined) {
                const newScrollTop = Math.max(0, Math.min(totalHeight - scrollableContainerHeight, offset - viewPosition * scrollableContainerHeight + viewOffset));
                setPendingScrollTop(newScrollTop);
                setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
            }
        },
        scrollToItem: ({ item, viewOffset = 0, viewPosition = 0, }) => {
            setIsStickingToBottom(false);
            const index = data.indexOf(item);
            if (index !== -1) {
                const offset = offsets[index];
                if (offset !== undefined) {
                    const newScrollTop = Math.max(0, Math.min(totalHeight - scrollableContainerHeight, offset - viewPosition * scrollableContainerHeight + viewOffset));
                    setPendingScrollTop(newScrollTop);
                    setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
                }
            }
        },
        getScrollIndex: () => scrollAnchor.index,
        getScrollState: () => ({
            scrollTop: getScrollTop(),
            scrollHeight: totalHeight,
            innerHeight: containerHeight,
        }),
    }), [
        offsets,
        scrollAnchor,
        totalHeight,
        getAnchorForScrollTop,
        data,
        scrollableContainerHeight,
        getScrollTop,
        setPendingScrollTop,
        containerHeight,
    ]);
    return (_jsx(Box, { ref: containerRef, overflowY: "scroll", overflowX: "hidden", scrollTop: scrollTop, scrollbarThumbColor: props.scrollbarThumbColor ?? theme.text.secondary, width: "100%", height: "100%", flexDirection: "column", paddingRight: 1, children: _jsxs(Box, { flexShrink: 0, width: "100%", flexDirection: "column", children: [_jsx(Box, { height: topSpacerHeight, flexShrink: 0 }), renderedItems, _jsx(Box, { height: bottomSpacerHeight, flexShrink: 0 })] }) }));
}
const VirtualizedListWithForwardRef = forwardRef(VirtualizedList);
export { VirtualizedListWithForwardRef as VirtualizedList };
VirtualizedList.displayName = 'VirtualizedList';
//# sourceMappingURL=VirtualizedList.js.map