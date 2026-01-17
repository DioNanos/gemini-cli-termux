import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useStreamingContext } from '../contexts/StreamingContext.js';
import { StreamingState } from '../types.js';
import { GeminiRespondingSpinner } from './GeminiRespondingSpinner.js';
import { formatDuration } from '../utils/formatters.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { isNarrowWidth } from '../utils/isNarrowWidth.js';
import { INTERACTIVE_SHELL_WAITING_PHRASE } from '../hooks/usePhraseCycler.js';
export const LoadingIndicator = ({ currentLoadingPhrase, elapsedTime, rightContent, thought, }) => {
    const streamingState = useStreamingContext();
    const { columns: terminalWidth } = useTerminalSize();
    const isNarrow = isNarrowWidth(terminalWidth);
    if (streamingState === StreamingState.Idle) {
        return null;
    }
    // Prioritize the interactive shell waiting phrase over the thought subject
    // because it conveys an actionable state for the user (waiting for input).
    const primaryText = currentLoadingPhrase === INTERACTIVE_SHELL_WAITING_PHRASE
        ? currentLoadingPhrase
        : thought?.subject || currentLoadingPhrase;
    const cancelAndTimerContent = streamingState !== StreamingState.WaitingForConfirmation
        ? `(esc to cancel, ${elapsedTime < 60 ? `${elapsedTime}s` : formatDuration(elapsedTime * 1000)})`
        : null;
    return (_jsxs(Box, { paddingLeft: 0, flexDirection: "column", children: [_jsxs(Box, { width: "100%", flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'flex-start' : 'center', children: [_jsxs(Box, { children: [_jsx(Box, { marginRight: 1, children: _jsx(GeminiRespondingSpinner, { nonRespondingDisplay: streamingState === StreamingState.WaitingForConfirmation
                                        ? '⠏'
                                        : '' }) }), primaryText && (_jsx(Text, { color: theme.text.accent, wrap: "truncate-end", children: primaryText })), !isNarrow && cancelAndTimerContent && (_jsxs(_Fragment, { children: [_jsx(Box, { flexShrink: 0, width: 1 }), _jsx(Text, { color: theme.text.secondary, children: cancelAndTimerContent })] }))] }), !isNarrow && _jsx(Box, { flexGrow: 1 }), !isNarrow && rightContent && _jsx(Box, { children: rightContent })] }), isNarrow && cancelAndTimerContent && (_jsx(Box, { children: _jsx(Text, { color: theme.text.secondary, children: cancelAndTimerContent }) })), isNarrow && rightContent && _jsx(Box, { children: rightContent })] }));
};
//# sourceMappingURL=LoadingIndicator.js.map