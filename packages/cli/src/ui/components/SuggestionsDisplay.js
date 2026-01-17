import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { PrepareLabel, MAX_WIDTH } from './PrepareLabel.js';
import { CommandKind } from '../commands/types.js';
import { Colors } from '../colors.js';
export const MAX_SUGGESTIONS_TO_SHOW = 8;
export { MAX_WIDTH };
export function SuggestionsDisplay({ suggestions, activeIndex, isLoading, width, scrollOffset, userInput, mode, expandedIndex, }) {
    if (isLoading) {
        return (_jsx(Box, { paddingX: 1, width: width, children: _jsx(Text, { color: "gray", children: "Loading suggestions..." }) }));
    }
    if (suggestions.length === 0) {
        return null; // Don't render anything if there are no suggestions
    }
    // Calculate the visible slice based on scrollOffset
    const startIndex = scrollOffset;
    const endIndex = Math.min(scrollOffset + MAX_SUGGESTIONS_TO_SHOW, suggestions.length);
    const visibleSuggestions = suggestions.slice(startIndex, endIndex);
    const COMMAND_KIND_SUFFIX = {
        [CommandKind.MCP_PROMPT]: ' [MCP]',
        [CommandKind.AGENT]: ' [Agent]',
    };
    const getFullLabel = (s) => s.label + (s.commandKind ? (COMMAND_KIND_SUFFIX[s.commandKind] ?? '') : '');
    const maxLabelLength = Math.max(...suggestions.map((s) => getFullLabel(s).length));
    const commandColumnWidth = mode === 'slash' ? Math.min(maxLabelLength, Math.floor(width * 0.5)) : 0;
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, width: width, children: [scrollOffset > 0 && _jsx(Text, { color: theme.text.primary, children: "\u25B2" }), visibleSuggestions.map((suggestion, index) => {
                const originalIndex = startIndex + index;
                const isActive = originalIndex === activeIndex;
                const isExpanded = originalIndex === expandedIndex;
                const textColor = isActive ? theme.text.accent : theme.text.secondary;
                const isLong = suggestion.value.length >= MAX_WIDTH;
                const labelElement = (_jsx(PrepareLabel, { label: suggestion.value, matchedIndex: suggestion.matchedIndex, userInput: userInput, textColor: textColor, isExpanded: isExpanded }));
                return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { ...(mode === 'slash'
                                ? { width: commandColumnWidth, flexShrink: 0 }
                                : { flexShrink: 1 }), children: _jsxs(Box, { children: [labelElement, suggestion.commandKind &&
                                        COMMAND_KIND_SUFFIX[suggestion.commandKind] && (_jsx(Text, { color: textColor, children: COMMAND_KIND_SUFFIX[suggestion.commandKind] }))] }) }), suggestion.description && (_jsx(Box, { flexGrow: 1, paddingLeft: 3, children: _jsx(Text, { color: textColor, wrap: "truncate", children: suggestion.description }) })), isActive && isLong && (_jsx(Box, { width: 3, flexShrink: 0, children: _jsx(Text, { color: Colors.Gray, children: isExpanded ? ' ← ' : ' → ' }) }))] }, `${suggestion.value}-${originalIndex}`));
            }), endIndex < suggestions.length && _jsx(Text, { color: "gray", children: "\u25BC" }), suggestions.length > MAX_SUGGESTIONS_TO_SHOW && (_jsxs(Text, { color: "gray", children: ["(", activeIndex + 1, "/", suggestions.length, ")"] }))] }));
}
//# sourceMappingURL=SuggestionsDisplay.js.map