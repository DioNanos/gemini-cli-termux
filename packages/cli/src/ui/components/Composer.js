import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { Box, useIsScreenReaderEnabled } from 'ink';
import { LoadingIndicator } from './LoadingIndicator.js';
import { StatusDisplay } from './StatusDisplay.js';
import { AutoAcceptIndicator } from './AutoAcceptIndicator.js';
import { ShellModeIndicator } from './ShellModeIndicator.js';
import { DetailedMessagesDisplay } from './DetailedMessagesDisplay.js';
import { RawMarkdownIndicator } from './RawMarkdownIndicator.js';
import { InputPrompt } from './InputPrompt.js';
import { Footer } from './Footer.js';
import { ShowMoreLines } from './ShowMoreLines.js';
import { QueuedMessageDisplay } from './QueuedMessageDisplay.js';
import { OverflowProvider } from '../contexts/OverflowContext.js';
import { isNarrowWidth } from '../utils/isNarrowWidth.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useUIActions } from '../contexts/UIActionsContext.js';
import { useVimMode } from '../contexts/VimModeContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useAlternateBuffer } from '../hooks/useAlternateBuffer.js';
import { ApprovalMode } from '@google/gemini-cli-core';
import { StreamingState } from '../types.js';
import { ConfigInitDisplay } from '../components/ConfigInitDisplay.js';
import { TodoTray } from './messages/Todo.js';
export const Composer = () => {
    const config = useConfig();
    const settings = useSettings();
    const isScreenReaderEnabled = useIsScreenReaderEnabled();
    const uiState = useUIState();
    const uiActions = useUIActions();
    const { vimEnabled } = useVimMode();
    const terminalWidth = process.stdout.columns;
    const isNarrow = isNarrowWidth(terminalWidth);
    const debugConsoleMaxHeight = Math.floor(Math.max(terminalWidth * 0.2, 5));
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const isAlternateBuffer = useAlternateBuffer();
    const { showAutoAcceptIndicator } = uiState;
    const suggestionsPosition = isAlternateBuffer ? 'above' : 'below';
    const hideContextSummary = suggestionsVisible && suggestionsPosition === 'above';
    return (_jsxs(Box, { flexDirection: "column", width: uiState.mainAreaWidth, flexGrow: 0, flexShrink: 0, children: [!uiState.embeddedShellFocused && (_jsx(LoadingIndicator, { thought: uiState.streamingState === StreamingState.WaitingForConfirmation ||
                    config.getAccessibility()?.enableLoadingPhrases === false
                    ? undefined
                    : uiState.thought, currentLoadingPhrase: config.getAccessibility()?.enableLoadingPhrases === false
                    ? undefined
                    : uiState.currentLoadingPhrase, elapsedTime: uiState.elapsedTime })), (!uiState.slashCommands || !uiState.isConfigInitialized) && (_jsx(ConfigInitDisplay, {})), _jsx(QueuedMessageDisplay, { messageQueue: uiState.messageQueue }), _jsx(TodoTray, {}), _jsxs(Box, { marginTop: 1, justifyContent: settings.merged.ui.hideContextSummary ? 'flex-start' : 'space-between', width: "100%", flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'flex-start' : 'center', children: [_jsx(Box, { marginRight: 1, children: _jsx(StatusDisplay, { hideContextSummary: hideContextSummary }) }), _jsxs(Box, { paddingTop: isNarrow ? 1 : 0, children: [showAutoAcceptIndicator !== ApprovalMode.DEFAULT &&
                                !uiState.shellModeActive && (_jsx(AutoAcceptIndicator, { approvalMode: showAutoAcceptIndicator })), uiState.shellModeActive && _jsx(ShellModeIndicator, {}), !uiState.renderMarkdown && _jsx(RawMarkdownIndicator, {})] })] }), uiState.showErrorDetails && (_jsx(OverflowProvider, { children: _jsxs(Box, { flexDirection: "column", children: [_jsx(DetailedMessagesDisplay, { messages: uiState.filteredConsoleMessages, maxHeight: uiState.constrainHeight ? debugConsoleMaxHeight : undefined, width: uiState.mainAreaWidth, hasFocus: uiState.showErrorDetails }), _jsx(ShowMoreLines, { constrainHeight: uiState.constrainHeight })] }) })), uiState.isInputActive && (_jsx(InputPrompt, { buffer: uiState.buffer, inputWidth: uiState.inputWidth, suggestionsWidth: uiState.suggestionsWidth, onSubmit: uiActions.handleFinalSubmit, userMessages: uiState.userMessages, setBannerVisible: uiActions.setBannerVisible, onClearScreen: uiActions.handleClearScreen, config: config, slashCommands: uiState.slashCommands || [], commandContext: uiState.commandContext, shellModeActive: uiState.shellModeActive, setShellModeActive: uiActions.setShellModeActive, approvalMode: showAutoAcceptIndicator, onEscapePromptChange: uiActions.onEscapePromptChange, focus: true, vimHandleInput: uiActions.vimHandleInput, isEmbeddedShellFocused: uiState.embeddedShellFocused, popAllMessages: uiActions.popAllMessages, placeholder: vimEnabled
                    ? "  Press 'i' for INSERT mode and 'Esc' for NORMAL mode."
                    : uiState.shellModeActive
                        ? '  Type your shell command'
                        : '  Type your message or @path/to/file', setQueueErrorMessage: uiActions.setQueueErrorMessage, streamingState: uiState.streamingState, suggestionsPosition: suggestionsPosition, onSuggestionsVisibilityChange: setSuggestionsVisible })), !settings.merged.ui.hideFooter && !isScreenReaderEnabled && _jsx(Footer, {})] }));
};
//# sourceMappingURL=Composer.js.map