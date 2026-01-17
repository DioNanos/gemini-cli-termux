import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRef, useCallback } from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { ScrollableList, } from './shared/ScrollableList.js';
const iconBoxWidth = 3;
export const DetailedMessagesDisplay = ({ messages, maxHeight, width, hasFocus }) => {
    const scrollableListRef = useRef(null);
    const borderAndPadding = 3;
    const estimatedItemHeight = useCallback((index) => {
        const msg = messages[index];
        if (!msg) {
            return 1;
        }
        const textWidth = width - borderAndPadding - iconBoxWidth;
        if (textWidth <= 0) {
            return 1;
        }
        const lines = Math.ceil((msg.content?.length || 1) / textWidth);
        return Math.max(1, lines);
    }, [width, messages]);
    if (messages.length === 0) {
        return null;
    }
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, borderStyle: "round", borderColor: theme.border.default, paddingLeft: 1, width: width, height: maxHeight, flexShrink: 0, flexGrow: 0, overflow: "hidden", children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { bold: true, color: theme.text.primary, children: ["Debug Console ", _jsx(Text, { color: theme.text.secondary, children: "(F12 to close)" })] }) }), _jsx(Box, { height: maxHeight, width: width - borderAndPadding, children: _jsx(ScrollableList, { ref: scrollableListRef, data: messages, renderItem: ({ item: msg }) => {
                        let textColor = theme.text.primary;
                        let icon = 'ℹ'; // Information source (ℹ)
                        switch (msg.type) {
                            case 'warn':
                                textColor = theme.status.warning;
                                icon = '⚠'; // Warning sign (⚠)
                                break;
                            case 'error':
                                textColor = theme.status.error;
                                icon = '✖'; // Heavy multiplication x (✖)
                                break;
                            case 'debug':
                                textColor = theme.text.secondary; // Or theme.text.secondary
                                icon = '🔍'; // Left-pointing magnifying glass (🔍)
                                break;
                            case 'log':
                            default:
                                // Default textColor and icon are already set
                                break;
                        }
                        return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { minWidth: iconBoxWidth, flexShrink: 0, children: _jsx(Text, { color: textColor, children: icon }) }), _jsxs(Text, { color: textColor, wrap: "wrap", children: [msg.content, msg.count && msg.count > 1 && (_jsxs(Text, { color: theme.text.secondary, children: [" (x", msg.count, ")"] }))] })] }));
                    }, keyExtractor: (item, index) => `${item.content}-${index}`, estimatedItemHeight: estimatedItemHeight, hasFocus: hasFocus, initialScrollIndex: Number.MAX_SAFE_INTEGER }) })] }));
};
//# sourceMappingURL=DetailedMessagesDisplay.js.map