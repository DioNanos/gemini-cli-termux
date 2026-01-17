import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box } from 'ink';
import { useUIState } from '../contexts/UIStateContext.js';
import { AppHeader } from './AppHeader.js';
import { HistoryItemDisplay } from './HistoryItemDisplay.js';
import { QuittingDisplay } from './QuittingDisplay.js';
import { useAppContext } from '../contexts/AppContext.js';
import { MAX_GEMINI_MESSAGE_LINES } from '../constants.js';
export const AlternateBufferQuittingDisplay = () => {
    const { version } = useAppContext();
    const uiState = useUIState();
    // We render the entire chat history and header here to ensure that the
    // conversation history is visible to the user after the app quits and the
    // user exits alternate buffer mode.
    // Our version of Ink is clever and will render a final frame outside of
    // the alternate buffer on app exit.
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, flexGrow: 0, width: uiState.terminalWidth, children: [_jsx(AppHeader, { version: version }, "app-header"), uiState.history.map((h) => (_jsx(HistoryItemDisplay, { terminalWidth: uiState.mainAreaWidth, availableTerminalHeight: undefined, availableTerminalHeightGemini: MAX_GEMINI_MESSAGE_LINES, item: h, isPending: false, commands: uiState.slashCommands }, h.id))), uiState.pendingHistoryItems.map((item, i) => (_jsx(HistoryItemDisplay, { availableTerminalHeight: undefined, terminalWidth: uiState.mainAreaWidth, item: { ...item, id: 0 }, isPending: true, isFocused: false, activeShellPtyId: uiState.activePtyId, embeddedShellFocused: uiState.embeddedShellFocused }, i))), _jsx(QuittingDisplay, {})] }));
};
//# sourceMappingURL=AlternateBufferQuittingDisplay.js.map