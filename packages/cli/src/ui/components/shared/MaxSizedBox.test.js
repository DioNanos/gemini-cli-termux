import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../../test-utils/render.js';
import { waitFor } from '../../../test-utils/async.js';
import { OverflowProvider } from '../../contexts/OverflowContext.js';
import { MaxSizedBox } from './MaxSizedBox.js';
import { Box, Text } from 'ink';
import { describe, it, expect } from 'vitest';
describe('<MaxSizedBox />', () => {
    it('renders children without truncation when they fit', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 10, children: _jsx(Box, { children: _jsx(Text, { children: "Hello, World!" }) }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('Hello, World!'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('hides lines when content exceeds maxHeight', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 2, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" })] }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... first 2 lines hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('hides lines at the end when content exceeds maxHeight and overflowDirection is bottom', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 2, overflowDirection: "bottom", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" })] }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... last 2 lines hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('shows plural "lines" when more than one line is hidden', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 2, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" })] }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... first 2 lines hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('shows singular "line" when exactly one line is hidden', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 2, additionalHiddenLinesCount: 1, children: _jsx(Box, { flexDirection: "column", children: _jsx(Text, { children: "Line 1" }) }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... first 1 line hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('accounts for additionalHiddenLinesCount', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 2, additionalHiddenLinesCount: 5, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" }), _jsx(Text, { children: "Line 3" })] }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... first 7 lines hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('wraps text that exceeds maxWidth', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 10, maxHeight: 5, children: _jsx(Box, { children: _jsx(Text, { wrap: "wrap", children: "This is a long line of text" }) }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('This is a'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('does not truncate when maxHeight is undefined', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: undefined, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Line 1" }), _jsx(Text, { children: "Line 2" })] }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('Line 1'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('renders an empty box for empty children', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 10 }) }));
        // Use waitFor to ensure ResizeObserver has a chance to run
        await waitFor(() => expect(lastFrame()).toBeDefined());
        expect(lastFrame()?.trim()).equals('');
        unmount();
    });
    it('handles React.Fragment as a child', async () => {
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 10, children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(_Fragment, { children: [_jsx(Text, { children: "Line 1 from Fragment" }), _jsx(Text, { children: "Line 2 from Fragment" })] }), _jsx(Text, { children: "Line 3 direct child" })] }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('Line 1 from Fragment'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('clips a long single text child from the top', async () => {
        const THIRTY_LINES = Array.from({ length: 30 }, (_, i) => `Line ${i + 1}`).join('\n');
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 10, overflowDirection: "top", children: _jsx(Box, { children: _jsx(Text, { children: THIRTY_LINES }) }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... first 21 lines hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
    it('clips a long single text child from the bottom', async () => {
        const THIRTY_LINES = Array.from({ length: 30 }, (_, i) => `Line ${i + 1}`).join('\n');
        const { lastFrame, unmount } = render(_jsx(OverflowProvider, { children: _jsx(MaxSizedBox, { maxWidth: 80, maxHeight: 10, overflowDirection: "bottom", children: _jsx(Box, { children: _jsx(Text, { children: THIRTY_LINES }) }) }) }));
        await waitFor(() => expect(lastFrame()).toContain('... last 21 lines hidden ...'));
        expect(lastFrame()).toMatchSnapshot();
        unmount();
    });
});
//# sourceMappingURL=MaxSizedBox.test.js.map