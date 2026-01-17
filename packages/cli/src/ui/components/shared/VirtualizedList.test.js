import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../../test-utils/render.js';
import { VirtualizedList } from './VirtualizedList.js';
import { Text, Box } from 'ink';
import { createRef, act, useEffect, createContext, useContext, useState, } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
describe('<VirtualizedList />', () => {
    const keyExtractor = (item) => item;
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('with 10px height and 100 items', () => {
        const longData = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
        // We use 1px for items. Container is 10px.
        // Viewport shows 10 items. Overscan adds 10 items.
        const itemHeight = 1;
        const renderItem1px = ({ item }) => (_jsx(Box, { height: itemHeight, children: _jsx(Text, { children: item }) }));
        it.each([
            {
                name: 'top',
                initialScrollIndex: undefined,
                visible: ['Item 0', 'Item 7'],
                notVisible: ['Item 8', 'Item 15', 'Item 50', 'Item 99'],
            },
            {
                name: 'scrolled to bottom',
                initialScrollIndex: 99,
                visible: ['Item 99', 'Item 92'],
                notVisible: ['Item 91', 'Item 85', 'Item 50', 'Item 0'],
            },
        ])('renders only visible items ($name)', async ({ initialScrollIndex, visible, notVisible }) => {
            const { lastFrame } = render(_jsx(Box, { height: 10, width: 100, borderStyle: "round", children: _jsx(VirtualizedList, { data: longData, renderItem: renderItem1px, keyExtractor: keyExtractor, estimatedItemHeight: () => itemHeight, initialScrollIndex: initialScrollIndex }) }));
            await act(async () => {
                await delay(0);
            });
            const frame = lastFrame();
            visible.forEach((item) => {
                expect(frame).toContain(item);
            });
            notVisible.forEach((item) => {
                expect(frame).not.toContain(item);
            });
            expect(frame).toMatchSnapshot();
        });
        it('sticks to bottom when new items added', async () => {
            const { lastFrame, rerender } = render(_jsx(Box, { height: 10, width: 100, borderStyle: "round", children: _jsx(VirtualizedList, { data: longData, renderItem: renderItem1px, keyExtractor: keyExtractor, estimatedItemHeight: () => itemHeight, initialScrollIndex: 99 }) }));
            await act(async () => {
                await delay(0);
            });
            expect(lastFrame()).toContain('Item 99');
            // Add items
            const newData = [...longData, 'Item 100', 'Item 101'];
            rerender(_jsx(Box, { height: 10, width: 100, borderStyle: "round", children: _jsx(VirtualizedList, { data: newData, renderItem: renderItem1px, keyExtractor: keyExtractor, estimatedItemHeight: () => itemHeight }) }));
            await act(async () => {
                await delay(0);
            });
            const frame = lastFrame();
            expect(frame).toContain('Item 101');
            expect(frame).not.toContain('Item 0');
        });
        it('scrolls down to show new items when requested via ref', async () => {
            const ref = createRef();
            const { lastFrame } = render(_jsx(Box, { height: 10, width: 100, borderStyle: "round", children: _jsx(VirtualizedList, { ref: ref, data: longData, renderItem: renderItem1px, keyExtractor: keyExtractor, estimatedItemHeight: () => itemHeight }) }));
            await act(async () => {
                await delay(0);
            });
            expect(lastFrame()).toContain('Item 0');
            // Scroll to bottom via ref
            await act(async () => {
                ref.current?.scrollToEnd();
                await delay(0);
            });
            const frame = lastFrame();
            expect(frame).toContain('Item 99');
        });
        it.each([
            { initialScrollIndex: 0, expectedMountedCount: 5 },
            { initialScrollIndex: 500, expectedMountedCount: 6 },
            { initialScrollIndex: 999, expectedMountedCount: 5 },
        ])('mounts only visible items with 1000 items and 10px height (scroll: $initialScrollIndex)', async ({ initialScrollIndex, expectedMountedCount }) => {
            let mountedCount = 0;
            const tallItemHeight = 5;
            const ItemWithEffect = ({ item }) => {
                useEffect(() => {
                    mountedCount++;
                    return () => {
                        mountedCount--;
                    };
                }, []);
                return (_jsx(Box, { height: tallItemHeight, children: _jsx(Text, { children: item }) }));
            };
            const veryLongData = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
            const { lastFrame } = render(_jsx(Box, { height: 20, width: 100, borderStyle: "round", children: _jsx(VirtualizedList, { data: veryLongData, renderItem: ({ item }) => (_jsx(ItemWithEffect, { item: item }, item)), keyExtractor: keyExtractor, estimatedItemHeight: () => tallItemHeight, initialScrollIndex: initialScrollIndex }) }));
            await act(async () => {
                await delay(0);
            });
            const frame = lastFrame();
            expect(mountedCount).toBe(expectedMountedCount);
            expect(frame).toMatchSnapshot();
        });
    });
    it('renders more items when a visible item shrinks via context update', async () => {
        const SizeContext = createContext({
            firstItemHeight: 10,
            setFirstItemHeight: () => { },
        });
        const items = Array.from({ length: 20 }, (_, i) => ({
            id: `Item ${i}`,
        }));
        const ItemWithContext = ({ item, index, }) => {
            const { firstItemHeight } = useContext(SizeContext);
            const height = index === 0 ? firstItemHeight : 1;
            return (_jsx(Box, { height: height, children: _jsx(Text, { children: item.id }) }));
        };
        const TestComponent = () => {
            const [firstItemHeight, setFirstItemHeight] = useState(10);
            return (_jsxs(SizeContext.Provider, { value: { firstItemHeight, setFirstItemHeight }, children: [_jsx(Box, { height: 10, width: 100, children: _jsx(VirtualizedList, { data: items, renderItem: ({ item, index }) => (_jsx(ItemWithContext, { item: item, index: index })), keyExtractor: (item) => item.id, estimatedItemHeight: () => 1 }) }), _jsx(TestControl, { setFirstItemHeight: setFirstItemHeight })] }));
        };
        let setHeightFn = () => { };
        const TestControl = ({ setFirstItemHeight, }) => {
            setHeightFn = setFirstItemHeight;
            return null;
        };
        const { lastFrame } = render(_jsx(TestComponent, {}));
        await act(async () => {
            await delay(0);
        });
        // Initially, only Item 0 (height 10) fills the 10px viewport
        expect(lastFrame()).toContain('Item 0');
        expect(lastFrame()).not.toContain('Item 1');
        // Shrink Item 0 to 1px via context
        await act(async () => {
            setHeightFn(1);
            await delay(0);
        });
        // Now Item 0 is 1px, so Items 1-9 should also be visible to fill 10px
        expect(lastFrame()).toContain('Item 0');
        expect(lastFrame()).toContain('Item 1');
        expect(lastFrame()).toContain('Item 9');
    });
    it('updates scroll position correctly when scrollBy is called multiple times in the same tick', async () => {
        const ref = createRef();
        const longData = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
        const itemHeight = 1;
        const renderItem1px = ({ item }) => (_jsx(Box, { height: itemHeight, children: _jsx(Text, { children: item }) }));
        const keyExtractor = (item) => item;
        render(_jsx(Box, { height: 10, width: 100, borderStyle: "round", children: _jsx(VirtualizedList, { ref: ref, data: longData, renderItem: renderItem1px, keyExtractor: keyExtractor, estimatedItemHeight: () => itemHeight }) }));
        await act(async () => {
            await delay(0);
        });
        expect(ref.current?.getScrollState().scrollTop).toBe(0);
        await act(async () => {
            ref.current?.scrollBy(1);
            ref.current?.scrollBy(1);
            await delay(0);
        });
        expect(ref.current?.getScrollState().scrollTop).toBe(2);
        await act(async () => {
            ref.current?.scrollBy(2);
            await delay(0);
        });
        expect(ref.current?.getScrollState().scrollTop).toBe(4);
    });
});
//# sourceMappingURL=VirtualizedList.test.js.map