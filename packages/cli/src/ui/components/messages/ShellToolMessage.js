import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Box, Text } from 'ink';
import { ToolCallStatus } from '../../types.js';
import { ShellInputPrompt } from '../ShellInputPrompt.js';
import { StickyHeader } from '../StickyHeader.js';
import { SHELL_COMMAND_NAME, SHELL_NAME, SHELL_FOCUS_HINT_DELAY_MS, } from '../../constants.js';
import { theme } from '../../semantic-colors.js';
import { SHELL_TOOL_NAME } from '@google/gemini-cli-core';
import { useUIActions } from '../../contexts/UIActionsContext.js';
import { useMouseClick } from '../../hooks/useMouseClick.js';
import { ToolResultDisplay } from './ToolResultDisplay.js';
import { ToolStatusIndicator, ToolInfo, TrailingIndicator, STATUS_INDICATOR_WIDTH, } from './ToolShared.js';
export const ShellToolMessage = ({ name, description, resultDisplay, status, availableTerminalHeight, terminalWidth, emphasis = 'medium', renderOutputAsMarkdown = true, activeShellPtyId, embeddedShellFocused, ptyId, config, isFirst, borderColor, borderDimColor, }) => {
    const isThisShellFocused = (name === SHELL_COMMAND_NAME ||
        name === SHELL_NAME ||
        name === SHELL_TOOL_NAME) &&
        status === ToolCallStatus.Executing &&
        ptyId === activeShellPtyId &&
        embeddedShellFocused;
    const { setEmbeddedShellFocused } = useUIActions();
    const headerRef = React.useRef(null);
    const contentRef = React.useRef(null);
    // The shell is focusable if it's the shell command, it's executing, and the interactive shell is enabled.
    const isThisShellFocusable = (name === SHELL_COMMAND_NAME ||
        name === SHELL_NAME ||
        name === SHELL_TOOL_NAME) &&
        status === ToolCallStatus.Executing &&
        config?.getEnableInteractiveShell();
    const handleFocus = () => {
        if (isThisShellFocusable) {
            setEmbeddedShellFocused(true);
        }
    };
    useMouseClick(headerRef, handleFocus, { isActive: !!isThisShellFocusable });
    useMouseClick(contentRef, handleFocus, { isActive: !!isThisShellFocusable });
    const wasFocusedRef = React.useRef(false);
    React.useEffect(() => {
        if (isThisShellFocused) {
            wasFocusedRef.current = true;
        }
        else if (wasFocusedRef.current) {
            if (embeddedShellFocused) {
                setEmbeddedShellFocused(false);
            }
            wasFocusedRef.current = false;
        }
    }, [isThisShellFocused, embeddedShellFocused, setEmbeddedShellFocused]);
    const [lastUpdateTime, setLastUpdateTime] = React.useState(null);
    const [userHasFocused, setUserHasFocused] = React.useState(false);
    const [showFocusHint, setShowFocusHint] = React.useState(false);
    React.useEffect(() => {
        if (resultDisplay) {
            setLastUpdateTime(new Date());
        }
    }, [resultDisplay]);
    React.useEffect(() => {
        if (!lastUpdateTime) {
            return;
        }
        const timer = setTimeout(() => {
            setShowFocusHint(true);
        }, SHELL_FOCUS_HINT_DELAY_MS);
        return () => clearTimeout(timer);
    }, [lastUpdateTime]);
    React.useEffect(() => {
        if (isThisShellFocused) {
            setUserHasFocused(true);
        }
    }, [isThisShellFocused]);
    const shouldShowFocusHint = isThisShellFocusable && (showFocusHint || userHasFocused);
    return (_jsxs(_Fragment, { children: [_jsxs(StickyHeader, { width: terminalWidth, isFirst: isFirst, borderColor: borderColor, borderDimColor: borderDimColor, containerRef: headerRef, children: [_jsx(ToolStatusIndicator, { status: status, name: name }), _jsx(ToolInfo, { name: name, status: status, description: description, emphasis: emphasis }), shouldShowFocusHint && (_jsx(Box, { marginLeft: 1, flexShrink: 0, children: _jsx(Text, { color: theme.text.accent, children: isThisShellFocused ? '(Focused)' : '(tab to focus)' }) })), emphasis === 'high' && _jsx(TrailingIndicator, {})] }), _jsxs(Box, { ref: contentRef, width: terminalWidth, borderStyle: "round", borderColor: borderColor, borderDimColor: borderDimColor, borderTop: false, borderBottom: false, borderLeft: true, borderRight: true, paddingX: 1, flexDirection: "column", children: [_jsx(ToolResultDisplay, { resultDisplay: resultDisplay, availableTerminalHeight: availableTerminalHeight, terminalWidth: terminalWidth, renderOutputAsMarkdown: renderOutputAsMarkdown }), isThisShellFocused && config && (_jsx(Box, { paddingLeft: STATUS_INDICATOR_WIDTH, marginTop: 1, children: _jsx(ShellInputPrompt, { activeShellPtyId: activeShellPtyId ?? null, focus: embeddedShellFocused }) }))] })] }));
};
//# sourceMappingURL=ShellToolMessage.js.map