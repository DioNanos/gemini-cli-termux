import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo, } from 'react';
import { Box, getInnerHeight, getScrollHeight } from 'ink';
import { useKeypress } from '../../hooks/useKeypress.js';
import { useScrollable } from '../../contexts/ScrollProvider.js';
import { useAnimatedScrollbar } from '../../hooks/useAnimatedScrollbar.js';
import { useBatchedScroll } from '../../hooks/useBatchedScroll.js';
export const Scrollable = ({ children, width, height, maxWidth, maxHeight, hasFocus, scrollToBottom, flexGrow, }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const ref = useRef(null);
    const [size, setSize] = useState({
        innerHeight: 0,
        scrollHeight: 0,
    });
    const sizeRef = useRef(size);
    useEffect(() => {
        sizeRef.current = size;
    }, [size]);
    const childrenCountRef = useRef(0);
    // This effect needs to run on every render to correctly measure the container
    // and scroll to the bottom if new children are added. The if conditions
    // prevent infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        const innerHeight = Math.round(getInnerHeight(ref.current));
        const scrollHeight = Math.round(getScrollHeight(ref.current));
        const isAtBottom = scrollTop >= size.scrollHeight - size.innerHeight - 1;
        if (size.innerHeight !== innerHeight ||
            size.scrollHeight !== scrollHeight) {
            setSize({ innerHeight, scrollHeight });
            if (isAtBottom) {
                setScrollTop(Math.max(0, scrollHeight - innerHeight));
            }
        }
        const childCountCurrent = React.Children.count(children);
        if (scrollToBottom && childrenCountRef.current !== childCountCurrent) {
            setScrollTop(Math.max(0, scrollHeight - innerHeight));
        }
        childrenCountRef.current = childCountCurrent;
    });
    const { getScrollTop, setPendingScrollTop } = useBatchedScroll(scrollTop);
    const scrollBy = useCallback((delta) => {
        const { scrollHeight, innerHeight } = sizeRef.current;
        const current = getScrollTop();
        const next = Math.min(Math.max(0, current + delta), Math.max(0, scrollHeight - innerHeight));
        setPendingScrollTop(next);
        setScrollTop(next);
    }, [sizeRef, getScrollTop, setPendingScrollTop]);
    const { scrollbarColor, flashScrollbar, scrollByWithAnimation } = useAnimatedScrollbar(hasFocus, scrollBy);
    useKeypress((key) => {
        if (key.shift) {
            if (key.name === 'up') {
                scrollByWithAnimation(-1);
            }
            if (key.name === 'down') {
                scrollByWithAnimation(1);
            }
        }
    }, { isActive: hasFocus });
    const getScrollState = useCallback(() => ({
        scrollTop: getScrollTop(),
        scrollHeight: size.scrollHeight,
        innerHeight: size.innerHeight,
    }), [getScrollTop, size.scrollHeight, size.innerHeight]);
    const hasFocusCallback = useCallback(() => hasFocus, [hasFocus]);
    const scrollableEntry = useMemo(() => ({
        ref: ref,
        getScrollState,
        scrollBy: scrollByWithAnimation,
        hasFocus: hasFocusCallback,
        flashScrollbar,
    }), [getScrollState, scrollByWithAnimation, hasFocusCallback, flashScrollbar]);
    useScrollable(scrollableEntry, hasFocus && ref.current !== null);
    return (_jsx(Box, { ref: ref, maxHeight: maxHeight, width: width ?? maxWidth, height: height, flexDirection: "column", overflowY: "scroll", overflowX: "hidden", scrollTop: scrollTop, flexGrow: flexGrow, scrollbarThumbColor: scrollbarColor, children: _jsx(Box, { flexShrink: 0, paddingRight: 1, flexDirection: "column", children: children }) }));
};
//# sourceMappingURL=Scrollable.js.map