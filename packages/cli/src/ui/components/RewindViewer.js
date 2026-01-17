import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Box, Text } from 'ink';
import { useUIState } from '../contexts/UIStateContext.js';
import { partToString, } from '@google/gemini-cli-core';
import { BaseSelectionList } from './shared/BaseSelectionList.js';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { useRewind } from '../hooks/useRewind.js';
import { RewindConfirmation, RewindOutcome } from './RewindConfirmation.js';
import { stripReferenceContent } from '../utils/formatters.js';
import { MaxSizedBox } from './shared/MaxSizedBox.js';
import { keyMatchers, Command } from '../keyMatchers.js';
const MAX_LINES_PER_BOX = 2;
export const RewindViewer = ({ conversation, onExit, onRewind, }) => {
    const { terminalWidth, terminalHeight } = useUIState();
    const { selectedMessageId, getStats, confirmationStats, selectMessage, clearSelection, } = useRewind(conversation);
    const interactions = useMemo(() => conversation.messages.filter((msg) => msg.type === 'user'), [conversation.messages]);
    const items = useMemo(() => interactions
        .map((msg, idx) => ({
        key: `${msg.id || 'msg'}-${idx}`,
        value: msg,
        index: idx,
    }))
        .reverse(), [interactions]);
    useKeypress((key) => {
        if (!selectedMessageId) {
            if (keyMatchers[Command.ESCAPE](key)) {
                onExit();
            }
        }
    }, { isActive: true });
    // Height constraint calculations
    const DIALOG_PADDING = 2; // Top/bottom padding
    const HEADER_HEIGHT = 2; // Title + margin
    const CONTROLS_HEIGHT = 2; // Controls text + margin
    const listHeight = Math.max(5, terminalHeight - DIALOG_PADDING - HEADER_HEIGHT - CONTROLS_HEIGHT - 2);
    const maxItemsToShow = Math.max(1, Math.floor(listHeight / 4));
    if (selectedMessageId) {
        const selectedMessage = interactions.find((m) => m.id === selectedMessageId);
        return (_jsx(RewindConfirmation, { stats: confirmationStats, terminalWidth: terminalWidth, timestamp: selectedMessage?.timestamp, onConfirm: (outcome) => {
                if (outcome === RewindOutcome.Cancel) {
                    clearSelection();
                }
                else {
                    const userPrompt = interactions.find((m) => m.id === selectedMessageId);
                    if (userPrompt) {
                        const originalUserText = userPrompt.content
                            ? partToString(userPrompt.content)
                            : '';
                        const cleanedText = stripReferenceContent(originalUserText);
                        onRewind(selectedMessageId, cleanedText, outcome);
                    }
                }
            } }));
    }
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", width: terminalWidth, paddingX: 1, paddingY: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { bold: true, children: ['> ', "Rewind"] }) }), _jsx(Box, { flexDirection: "column", flexGrow: 1, children: _jsx(BaseSelectionList, { items: items, isFocused: true, showNumbers: false, onSelect: (item) => {
                        const userPrompt = item;
                        if (userPrompt && userPrompt.id) {
                            selectMessage(userPrompt.id);
                        }
                    }, maxItemsToShow: maxItemsToShow, renderItem: (itemWrapper, { isSelected }) => {
                        const userPrompt = itemWrapper.value;
                        const stats = getStats(userPrompt);
                        const firstFileName = stats?.details?.at(0)?.fileName;
                        const originalUserText = userPrompt.content
                            ? partToString(userPrompt.content)
                            : '';
                        const cleanedText = stripReferenceContent(originalUserText);
                        return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { children: _jsx(MaxSizedBox, { maxWidth: terminalWidth - 4, maxHeight: isSelected ? undefined : MAX_LINES_PER_BOX + 1, overflowDirection: "bottom", children: cleanedText.split('\n').map((line, i) => (_jsx(Box, { children: _jsx(Text, { color: isSelected
                                                    ? theme.status.success
                                                    : theme.text.primary, children: line }) }, i))) }) }), stats ? (_jsxs(Box, { flexDirection: "row", children: [_jsxs(Text, { color: theme.text.secondary, children: [stats.fileCount === 1
                                                    ? firstFileName
                                                        ? firstFileName
                                                        : '1 file changed'
                                                    : `${stats.fileCount} files changed`, ' '] }), stats.addedLines > 0 && (_jsxs(Text, { color: "green", children: ["+", stats.addedLines, " "] })), stats.removedLines > 0 && (_jsxs(Text, { color: "red", children: ["-", stats.removedLines] }))] })) : (_jsx(Text, { color: theme.text.secondary, children: "No files have been changed" }))] }));
                    } }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.secondary, children: "(Use Enter to select a message, Esc to close)" }) })] }));
};
//# sourceMappingURL=RewindViewer.js.map