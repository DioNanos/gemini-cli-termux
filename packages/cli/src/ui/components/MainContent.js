import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Static } from 'ink';
import { HistoryItemDisplay } from './HistoryItemDisplay.js';
import { ShowMoreLines } from './ShowMoreLines.js';
import { OverflowProvider } from '../contexts/OverflowContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useAppContext } from '../contexts/AppContext.js';
import { AppHeader } from './AppHeader.js';
import { useAlternateBuffer } from '../hooks/useAlternateBuffer.js';
import { SCROLL_TO_ITEM_END } from './shared/VirtualizedList.js';
import { ScrollableList } from './shared/ScrollableList.js';
import { useMemo, memo, useCallback } from 'react';
import { MAX_GEMINI_MESSAGE_LINES } from '../constants.js';
const MemoizedHistoryItemDisplay = memo(HistoryItemDisplay);
const MemoizedAppHeader = memo(AppHeader);
// Limit Gemini messages to a very high number of lines to mitigate performance
// issues in the worst case if we somehow get an enormous response from Gemini.
// This threshold is arbitrary but should be high enough to never impact normal
// usage.
export const MainContent = () => {
    const { version } = useAppContext();
    const uiState = useUIState();
    const isAlternateBuffer = useAlternateBuffer();
    const { pendingHistoryItems, mainAreaWidth, staticAreaMaxItemHeight, availableTerminalHeight, } = uiState;
    const historyItems = useMemo(() => uiState.history.map((h) => (_jsx(MemoizedHistoryItemDisplay, { terminalWidth: mainAreaWidth, availableTerminalHeight: staticAreaMaxItemHeight, availableTerminalHeightGemini: MAX_GEMINI_MESSAGE_LINES, item: h, isPending: false, commands: uiState.slashCommands }, h.id))), [
        uiState.history,
        mainAreaWidth,
        staticAreaMaxItemHeight,
        uiState.slashCommands,
    ]);
    const pendingItems = useMemo(() => (_jsx(OverflowProvider, { children: _jsxs(Box, { flexDirection: "column", children: [pendingHistoryItems.map((item, i) => (_jsx(HistoryItemDisplay, { availableTerminalHeight: uiState.constrainHeight && !isAlternateBuffer
                        ? availableTerminalHeight
                        : undefined, terminalWidth: mainAreaWidth, item: { ...item, id: 0 }, isPending: true, isFocused: !uiState.isEditorDialogOpen, activeShellPtyId: uiState.activePtyId, embeddedShellFocused: uiState.embeddedShellFocused }, i))), _jsx(ShowMoreLines, { constrainHeight: uiState.constrainHeight })] }) })), [
        pendingHistoryItems,
        uiState.constrainHeight,
        isAlternateBuffer,
        availableTerminalHeight,
        mainAreaWidth,
        uiState.isEditorDialogOpen,
        uiState.activePtyId,
        uiState.embeddedShellFocused,
    ]);
    const virtualizedData = useMemo(() => [
        { type: 'header' },
        ...uiState.history.map((item) => ({ type: 'history', item })),
        { type: 'pending' },
    ], [uiState.history]);
    const renderItem = useCallback(({ item }) => {
        if (item.type === 'header') {
            return _jsx(MemoizedAppHeader, { version: version }, "app-header");
        }
        else if (item.type === 'history') {
            return (_jsx(MemoizedHistoryItemDisplay, { terminalWidth: mainAreaWidth, availableTerminalHeight: undefined, availableTerminalHeightGemini: MAX_GEMINI_MESSAGE_LINES, item: item.item, isPending: false, commands: uiState.slashCommands }, item.item.id));
        }
        else {
            return pendingItems;
        }
    }, [version, mainAreaWidth, uiState.slashCommands, pendingItems]);
    if (isAlternateBuffer) {
        return (_jsx(ScrollableList, { hasFocus: !uiState.isEditorDialogOpen, data: virtualizedData, renderItem: renderItem, estimatedItemHeight: () => 100, keyExtractor: (item, _index) => {
                if (item.type === 'header')
                    return 'header';
                if (item.type === 'history')
                    return item.item.id.toString();
                return 'pending';
            }, initialScrollIndex: SCROLL_TO_ITEM_END, initialScrollOffsetInIndex: SCROLL_TO_ITEM_END }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(Static, { items: [
                    _jsx(AppHeader, { version: version }, "app-header"),
                    ...historyItems,
                ], children: (item) => item }, uiState.historyRemountKey), pendingItems] }));
};
//# sourceMappingURL=MainContent.js.map