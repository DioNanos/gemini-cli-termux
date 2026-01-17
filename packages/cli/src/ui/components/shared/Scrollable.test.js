import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { renderWithProviders } from '../../../test-utils/render.js';
import { Scrollable } from './Scrollable.js';
import { Text } from 'ink';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ScrollProviderModule from '../../contexts/ScrollProvider.js';
import { act } from 'react';
vi.mock('ink', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getInnerHeight: vi.fn(() => 5),
        getScrollHeight: vi.fn(() => 10),
        getBoundingBox: vi.fn(() => ({ x: 0, y: 0, width: 10, height: 5 })),
    };
});
vi.mock('../../hooks/useAnimatedScrollbar.js', () => ({
    useAnimatedScrollbar: (hasFocus, scrollBy) => ({
        scrollbarColor: 'white',
        flashScrollbar: vi.fn(),
        scrollByWithAnimation: scrollBy,
    }),
}));
describe('<Scrollable />', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    it('renders children', () => {
        const { lastFrame } = renderWithProviders(_jsx(Scrollable, { hasFocus: false, height: 5, children: _jsx(Text, { children: "Hello World" }) }));
        expect(lastFrame()).toContain('Hello World');
    });
    it('renders multiple children', () => {
        const { lastFrame } = renderWithProviders(_jsxs(Scrollable, { hasFocus: false, height: 5, children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" })] }));
        expect(lastFrame()).toContain('Line 1');
        expect(lastFrame()).toContain('Line 2');
        expect(lastFrame()).toContain('Line 3');
    });
    it('matches snapshot', () => {
        const { lastFrame } = renderWithProviders(_jsxs(Scrollable, { hasFocus: false, height: 5, children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" })] }));
        expect(lastFrame()).toMatchSnapshot();
    });
    it('updates scroll position correctly when scrollBy is called multiple times in the same tick', () => {
        let capturedEntry;
        vi.spyOn(ScrollProviderModule, 'useScrollable').mockImplementation((entry, isActive) => {
            if (isActive) {
                capturedEntry = entry;
            }
        });
        renderWithProviders(_jsxs(Scrollable, { hasFocus: true, height: 5, children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" }), _jsx(Text, { children: "Line 4" }), _jsx(Text, { children: "Line 5" }), _jsx(Text, { children: "Line 6" }), _jsx(Text, { children: "Line 7" }), _jsx(Text, { children: "Line 8" }), _jsx(Text, { children: "Line 9" }), _jsx(Text, { children: "Line 10" })] }));
        expect(capturedEntry).toBeDefined();
        if (!capturedEntry) {
            throw new Error('capturedEntry is undefined');
        }
        // Initial state (starts at bottom because of auto-scroll logic)
        expect(capturedEntry.getScrollState().scrollTop).toBe(5);
        // Call scrollBy multiple times (upwards) in the same tick
        act(() => {
            capturedEntry.scrollBy(-1);
            capturedEntry.scrollBy(-1);
        });
        // Should have moved up by 2
        expect(capturedEntry.getScrollState().scrollTop).toBe(3);
        act(() => {
            capturedEntry.scrollBy(-2);
        });
        expect(capturedEntry.getScrollState().scrollTop).toBe(1);
    });
});
//# sourceMappingURL=Scrollable.test.js.map