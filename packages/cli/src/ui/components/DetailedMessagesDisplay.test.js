import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { DetailedMessagesDisplay } from './DetailedMessagesDisplay.js';
import { describe, it, expect, vi } from 'vitest';
import { Box } from 'ink';
vi.mock('./shared/ScrollableList.js', () => ({
    ScrollableList: ({ data, renderItem, }) => (_jsx(Box, { flexDirection: "column", children: data.map((item, index) => (_jsx(Box, { children: renderItem({ item }) }, index))) })),
}));
describe('DetailedMessagesDisplay', () => {
    it('renders nothing when messages are empty', () => {
        const { lastFrame } = render(_jsx(DetailedMessagesDisplay, { messages: [], maxHeight: 10, width: 80, hasFocus: false }));
        expect(lastFrame()).toBe('');
    });
    it('renders messages correctly', () => {
        const messages = [
            { type: 'log', content: 'Log message', count: 1 },
            { type: 'warn', content: 'Warning message', count: 1 },
            { type: 'error', content: 'Error message', count: 1 },
            { type: 'debug', content: 'Debug message', count: 1 },
        ];
        const { lastFrame } = render(_jsx(DetailedMessagesDisplay, { messages: messages, maxHeight: 20, width: 80, hasFocus: true }));
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
    it('renders message counts', () => {
        const messages = [
            { type: 'log', content: 'Repeated message', count: 5 },
        ];
        const { lastFrame } = render(_jsx(DetailedMessagesDisplay, { messages: messages, maxHeight: 10, width: 80, hasFocus: false }));
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
});
//# sourceMappingURL=DetailedMessagesDisplay.test.js.map