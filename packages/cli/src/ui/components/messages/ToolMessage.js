import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { StickyHeader } from '../StickyHeader.js';
import { ToolResultDisplay } from './ToolResultDisplay.js';
import { ToolStatusIndicator, ToolInfo, TrailingIndicator, STATUS_INDICATOR_WIDTH, } from './ToolShared.js';
import { SHELL_COMMAND_NAME, SHELL_FOCUS_HINT_DELAY_MS, } from '../../constants.js';
import { theme } from '../../semantic-colors.js';
import { useInactivityTimer } from '../../hooks/useInactivityTimer.js';
import { ToolCallStatus } from '../../types.js';
import { ShellInputPrompt } from '../ShellInputPrompt.js';
export const ToolMessage = ({ name, description, resultDisplay, status, availableTerminalHeight, terminalWidth, emphasis = 'medium', renderOutputAsMarkdown = true, isFirst, borderColor, borderDimColor, activeShellPtyId, embeddedShellFocused, ptyId, config, }) => {
    const isThisShellFocused = (name === SHELL_COMMAND_NAME || name === 'Shell') &&
        status === ToolCallStatus.Executing &&
        ptyId === activeShellPtyId &&
        embeddedShellFocused;
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const [userHasFocused, setUserHasFocused] = useState(false);
    const showFocusHint = useInactivityTimer(!!lastUpdateTime, lastUpdateTime ? lastUpdateTime.getTime() : 0, SHELL_FOCUS_HINT_DELAY_MS);
    useEffect(() => {
        if (resultDisplay) {
            setLastUpdateTime(new Date());
        }
    }, [resultDisplay]);
    useEffect(() => {
        if (isThisShellFocused) {
            setUserHasFocused(true);
        }
    }, [isThisShellFocused]);
    const isThisShellFocusable = (name === SHELL_COMMAND_NAME || name === 'Shell') &&
        status === ToolCallStatus.Executing &&
        config?.getEnableInteractiveShell();
    const shouldShowFocusHint = isThisShellFocusable && (showFocusHint || userHasFocused);
    return (
    // It is crucial we don't replace this <> with a Box because otherwise the
    // sticky header inside it would be sticky to that box rather than to the
    // parent component of this ToolMessage.
    _jsxs(_Fragment, { children: [_jsxs(StickyHeader, { width: terminalWidth, isFirst: isFirst, borderColor: borderColor, borderDimColor: borderDimColor, children: [_jsx(ToolStatusIndicator, { status: status, name: name }), _jsx(ToolInfo, { name: name, status: status, description: description, emphasis: emphasis }), shouldShowFocusHint && (_jsx(Box, { marginLeft: 1, flexShrink: 0, children: _jsx(Text, { color: theme.text.accent, children: isThisShellFocused ? '(Focused)' : '(tab to focus)' }) })), emphasis === 'high' && _jsx(TrailingIndicator, {})] }), _jsxs(Box, { width: terminalWidth, borderStyle: "round", borderColor: borderColor, borderDimColor: borderDimColor, borderTop: false, borderBottom: false, borderLeft: true, borderRight: true, paddingX: 1, flexDirection: "column", children: [_jsx(ToolResultDisplay, { resultDisplay: resultDisplay, availableTerminalHeight: availableTerminalHeight, terminalWidth: terminalWidth, renderOutputAsMarkdown: renderOutputAsMarkdown }), isThisShellFocused && config && (_jsx(Box, { paddingLeft: STATUS_INDICATOR_WIDTH, marginTop: 1, children: _jsx(ShellInputPrompt, { activeShellPtyId: activeShellPtyId ?? null, focus: embeddedShellFocused }) }))] })] }));
};
//# sourceMappingURL=ToolMessage.js.map