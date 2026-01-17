import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { getBoundingBox } from 'ink';
import { useMouse } from '../hooks/useMouse.js';
const ScrollContext = createContext(null);
const findScrollableCandidates = (mouseEvent, scrollables) => {
    const candidates = [];
    for (const entry of scrollables.values()) {
        if (!entry.ref.current || !entry.hasFocus()) {
            continue;
        }
        const boundingBox = getBoundingBox(entry.ref.current);
        if (!boundingBox)
            continue;
        const { x, y, width, height } = boundingBox;
        const isInside = mouseEvent.col >= x &&
            mouseEvent.col < x + width + 1 && // Intentionally add one to width to include scrollbar.
            mouseEvent.row >= y &&
            mouseEvent.row < y + height;
        if (isInside) {
            candidates.push({ ...entry, area: width * height });
        }
    }
    // Sort by smallest area first
    candidates.sort((a, b) => a.area - b.area);
    return candidates;
};
export const ScrollProvider = ({ children, }) => {
    const [scrollables, setScrollables] = useState(new Map());
    const register = useCallback((entry) => {
        setScrollables((prev) => new Map(prev).set(entry.id, entry));
    }, []);
    const unregister = useCallback((id) => {
        setScrollables((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);
    const scrollablesRef = useRef(scrollables);
    useEffect(() => {
        scrollablesRef.current = scrollables;
    }, [scrollables]);
    const pendingScrollsRef = useRef(new Map());
    const flushScheduledRef = useRef(false);
    const dragStateRef = useRef({
        active: false,
        id: null,
        offset: 0,
    });
    const scheduleFlush = useCallback(() => {
        if (!flushScheduledRef.current) {
            flushScheduledRef.current = true;
            setTimeout(() => {
                flushScheduledRef.current = false;
                for (const [id, delta] of pendingScrollsRef.current.entries()) {
                    const entry = scrollablesRef.current.get(id);
                    if (entry) {
                        entry.scrollBy(delta);
                    }
                }
                pendingScrollsRef.current.clear();
            }, 0);
        }
    }, []);
    const handleScroll = (direction, mouseEvent) => {
        const delta = direction === 'up' ? -1 : 1;
        const candidates = findScrollableCandidates(mouseEvent, scrollablesRef.current);
        for (const candidate of candidates) {
            const { scrollTop, scrollHeight, innerHeight } = candidate.getScrollState();
            const pendingDelta = pendingScrollsRef.current.get(candidate.id) || 0;
            const effectiveScrollTop = scrollTop + pendingDelta;
            // Epsilon to handle floating point inaccuracies.
            const canScrollUp = effectiveScrollTop > 0.001;
            const canScrollDown = effectiveScrollTop < scrollHeight - innerHeight - 0.001;
            if (direction === 'up' && canScrollUp) {
                pendingScrollsRef.current.set(candidate.id, pendingDelta + delta);
                scheduleFlush();
                return true;
            }
            if (direction === 'down' && canScrollDown) {
                pendingScrollsRef.current.set(candidate.id, pendingDelta + delta);
                scheduleFlush();
                return true;
            }
        }
        return false;
    };
    const handleLeftPress = (mouseEvent) => {
        // Check for scrollbar interaction first
        for (const entry of scrollablesRef.current.values()) {
            if (!entry.ref.current || !entry.hasFocus()) {
                continue;
            }
            const boundingBox = getBoundingBox(entry.ref.current);
            if (!boundingBox)
                continue;
            const { x, y, width, height } = boundingBox;
            // Check if click is on the scrollbar column (x + width)
            // The findScrollableCandidates logic implies scrollbar is at x + width.
            if (mouseEvent.col === x + width &&
                mouseEvent.row >= y &&
                mouseEvent.row < y + height) {
                const { scrollTop, scrollHeight, innerHeight } = entry.getScrollState();
                if (scrollHeight <= innerHeight)
                    continue;
                const thumbHeight = Math.max(1, Math.floor((innerHeight / scrollHeight) * innerHeight));
                const maxScrollTop = scrollHeight - innerHeight;
                const maxThumbY = innerHeight - thumbHeight;
                if (maxThumbY <= 0)
                    continue;
                const currentThumbY = Math.round((scrollTop / maxScrollTop) * maxThumbY);
                const absoluteThumbTop = y + currentThumbY;
                const absoluteThumbBottom = absoluteThumbTop + thumbHeight;
                const isTop = mouseEvent.row === y;
                const isBottom = mouseEvent.row === y + height - 1;
                const hitTop = isTop ? absoluteThumbTop : absoluteThumbTop - 1;
                const hitBottom = isBottom
                    ? absoluteThumbBottom
                    : absoluteThumbBottom + 1;
                const isThumbClick = mouseEvent.row >= hitTop && mouseEvent.row < hitBottom;
                let offset = 0;
                const relativeMouseY = mouseEvent.row - y;
                if (isThumbClick) {
                    offset = relativeMouseY - currentThumbY;
                }
                else {
                    // Track click - Jump to position
                    // Center the thumb on the mouse click
                    const targetThumbY = Math.max(0, Math.min(maxThumbY, relativeMouseY - Math.floor(thumbHeight / 2)));
                    const newScrollTop = Math.round((targetThumbY / maxThumbY) * maxScrollTop);
                    if (entry.scrollTo) {
                        entry.scrollTo(newScrollTop);
                    }
                    else {
                        entry.scrollBy(newScrollTop - scrollTop);
                    }
                    offset = relativeMouseY - targetThumbY;
                }
                // Start drag (for both thumb and track clicks)
                dragStateRef.current = {
                    active: true,
                    id: entry.id,
                    offset,
                };
                return true;
            }
        }
        const candidates = findScrollableCandidates(mouseEvent, scrollablesRef.current);
        if (candidates.length > 0) {
            // The first candidate is the innermost one.
            candidates[0].flashScrollbar();
            // We don't consider just flashing the scrollbar as handling the event
            // in a way that should prevent other handlers (like drag warning)
            // from checking it, although for left-press it doesn't matter much.
            // But returning false is safer.
            return false;
        }
        return false;
    };
    const handleMove = (mouseEvent) => {
        const state = dragStateRef.current;
        if (!state.active || !state.id)
            return false;
        const entry = scrollablesRef.current.get(state.id);
        if (!entry || !entry.ref.current) {
            state.active = false;
            return false;
        }
        const boundingBox = getBoundingBox(entry.ref.current);
        if (!boundingBox)
            return false;
        const { y } = boundingBox;
        const { scrollTop, scrollHeight, innerHeight } = entry.getScrollState();
        const thumbHeight = Math.max(1, Math.floor((innerHeight / scrollHeight) * innerHeight));
        const maxScrollTop = scrollHeight - innerHeight;
        const maxThumbY = innerHeight - thumbHeight;
        if (maxThumbY <= 0)
            return false;
        const relativeMouseY = mouseEvent.row - y;
        // Calculate the target thumb position based on the mouse position and the offset.
        // We clamp it to the valid range [0, maxThumbY].
        const targetThumbY = Math.max(0, Math.min(maxThumbY, relativeMouseY - state.offset));
        const targetScrollTop = Math.round((targetThumbY / maxThumbY) * maxScrollTop);
        if (entry.scrollTo) {
            entry.scrollTo(targetScrollTop, 0);
        }
        else {
            entry.scrollBy(targetScrollTop - scrollTop);
        }
        return true;
    };
    const handleLeftRelease = () => {
        if (dragStateRef.current.active) {
            dragStateRef.current = {
                active: false,
                id: null,
                offset: 0,
            };
            return true;
        }
        return false;
    };
    useMouse((event) => {
        if (event.name === 'scroll-up') {
            return handleScroll('up', event);
        }
        else if (event.name === 'scroll-down') {
            return handleScroll('down', event);
        }
        else if (event.name === 'left-press') {
            return handleLeftPress(event);
        }
        else if (event.name === 'move') {
            return handleMove(event);
        }
        else if (event.name === 'left-release') {
            return handleLeftRelease();
        }
        return false;
    }, { isActive: true });
    const contextValue = useMemo(() => ({ register, unregister }), [register, unregister]);
    return (_jsx(ScrollContext.Provider, { value: contextValue, children: children }));
};
let nextId = 0;
export const useScrollable = (entry, isActive) => {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error('useScrollable must be used within a ScrollProvider');
    }
    const [id] = useState(() => `scrollable-${nextId++}`);
    useEffect(() => {
        if (isActive) {
            context.register({ ...entry, id });
            return () => {
                context.unregister(id);
            };
        }
        return;
    }, [context, entry, id, isActive]);
};
//# sourceMappingURL=ScrollProvider.js.map