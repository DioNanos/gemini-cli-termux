import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { waitFor } from '../../test-utils/async.js';
import { MainContent } from './MainContent.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Box, Text } from 'ink';
// Mock dependencies
vi.mock('../contexts/AppContext.js', () => ({
    useAppContext: () => ({
        version: '1.0.0',
    }),
}));
vi.mock('../contexts/UIStateContext.js', () => ({
    useUIState: () => ({
        history: [
            { id: 1, role: 'user', content: 'Hello' },
            { id: 2, role: 'model', content: 'Hi there' },
        ],
        pendingHistoryItems: [],
        mainAreaWidth: 80,
        staticAreaMaxItemHeight: 20,
        availableTerminalHeight: 24,
        slashCommands: [],
        constrainHeight: false,
        isEditorDialogOpen: false,
        activePtyId: undefined,
        embeddedShellFocused: false,
        historyRemountKey: 0,
    }),
}));
vi.mock('../hooks/useAlternateBuffer.js', () => ({
    useAlternateBuffer: vi.fn(),
}));
vi.mock('./HistoryItemDisplay.js', () => ({
    HistoryItemDisplay: ({ item, availableTerminalHeight, }) => (_jsx(Box, { children: _jsxs(Text, { children: ["HistoryItem: ", item.content, " (height:", ' ', availableTerminalHeight === undefined
                    ? 'undefined'
                    : availableTerminalHeight, ")"] }) })),
}));
vi.mock('./AppHeader.js', () => ({
    AppHeader: () => _jsx(Text, { children: "AppHeader" }),
}));
vi.mock('./ShowMoreLines.js', () => ({
    ShowMoreLines: () => _jsx(Text, { children: "ShowMoreLines" }),
}));
vi.mock('./shared/ScrollableList.js', () => ({
    ScrollableList: ({ data, renderItem, }) => (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "ScrollableList" }), data.map((item, index) => (_jsx(Box, { children: renderItem({ item }) }, index)))] })),
    SCROLL_TO_ITEM_END: 0,
}));
import { useAlternateBuffer } from '../hooks/useAlternateBuffer.js';
describe('MainContent', () => {
    beforeEach(() => {
        vi.mocked(useAlternateBuffer).mockReturnValue(false);
    });
    it('renders in normal buffer mode', async () => {
        const { lastFrame } = render(_jsx(MainContent, {}));
        await waitFor(() => expect(lastFrame()).toContain('AppHeader'));
        const output = lastFrame();
        expect(output).toContain('HistoryItem: Hello (height: 20)');
        expect(output).toContain('HistoryItem: Hi there (height: 20)');
    });
    it('renders in alternate buffer mode', async () => {
        vi.mocked(useAlternateBuffer).mockReturnValue(true);
        const { lastFrame } = render(_jsx(MainContent, {}));
        await waitFor(() => expect(lastFrame()).toContain('ScrollableList'));
        const output = lastFrame();
        expect(output).toContain('AppHeader');
        expect(output).toContain('HistoryItem: Hello (height: undefined)');
        expect(output).toContain('HistoryItem: Hi there (height: undefined)');
    });
    it('does not constrain height in alternate buffer mode', async () => {
        vi.mocked(useAlternateBuffer).mockReturnValue(true);
        const { lastFrame } = render(_jsx(MainContent, {}));
        await waitFor(() => expect(lastFrame()).toContain('HistoryItem: Hello'));
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
});
//# sourceMappingURL=MainContent.test.js.map