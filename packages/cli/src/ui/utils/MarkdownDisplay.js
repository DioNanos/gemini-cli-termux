import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Text, Box } from 'ink';
import { theme } from '../semantic-colors.js';
import { colorizeCode } from './CodeColorizer.js';
import { TableRenderer } from './TableRenderer.js';
import { RenderInline } from './InlineMarkdownRenderer.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useAlternateBuffer } from '../hooks/useAlternateBuffer.js';
// Constants for Markdown parsing and rendering
const EMPTY_LINE_HEIGHT = 1;
const CODE_BLOCK_PREFIX_PADDING = 1;
const LIST_ITEM_PREFIX_PADDING = 1;
const LIST_ITEM_TEXT_FLEX_GROW = 1;
const MarkdownDisplayInternal = ({ text, isPending, availableTerminalHeight, terminalWidth, renderMarkdown = true, }) => {
    const settings = useSettings();
    const isAlternateBuffer = useAlternateBuffer();
    const responseColor = theme.text.response ?? theme.text.primary;
    if (!text)
        return _jsx(_Fragment, {});
    // Raw markdown mode - display syntax-highlighted markdown without rendering
    if (!renderMarkdown) {
        // Hide line numbers in raw markdown mode as they are confusing due to chunked output
        const colorizedMarkdown = colorizeCode({
            code: text,
            language: 'markdown',
            availableHeight: isAlternateBuffer ? undefined : availableTerminalHeight,
            maxWidth: terminalWidth - CODE_BLOCK_PREFIX_PADDING,
            settings,
            hideLineNumbers: true,
        });
        return (_jsx(Box, { paddingLeft: CODE_BLOCK_PREFIX_PADDING, flexDirection: "column", children: colorizedMarkdown }));
    }
    const lines = text.split(/\r?\n/);
    const headerRegex = /^ *(#{1,4}) +(.*)/;
    const codeFenceRegex = /^ *(`{3,}|~{3,}) *(\w*?) *$/;
    const ulItemRegex = /^([ \t]*)([-*+]) +(.*)/;
    const olItemRegex = /^([ \t]*)(\d+)\. +(.*)/;
    const hrRegex = /^ *([-*_] *){3,} *$/;
    const tableRowRegex = /^\s*\|(.+)\|\s*$/;
    const tableSeparatorRegex = /^\s*\|?\s*(:?-+:?)\s*(\|\s*(:?-+:?)\s*)+\|?\s*$/;
    const contentBlocks = [];
    let inCodeBlock = false;
    let lastLineEmpty = true;
    let codeBlockContent = [];
    let codeBlockLang = null;
    let codeBlockFence = '';
    let inTable = false;
    let tableRows = [];
    let tableHeaders = [];
    function addContentBlock(block) {
        if (block) {
            contentBlocks.push(block);
            lastLineEmpty = false;
        }
    }
    lines.forEach((line, index) => {
        const key = `line-${index}`;
        if (inCodeBlock) {
            const fenceMatch = line.match(codeFenceRegex);
            if (fenceMatch &&
                fenceMatch[1].startsWith(codeBlockFence[0]) &&
                fenceMatch[1].length >= codeBlockFence.length) {
                addContentBlock(_jsx(RenderCodeBlock, { content: codeBlockContent, lang: codeBlockLang, isPending: isPending, availableTerminalHeight: isAlternateBuffer ? undefined : availableTerminalHeight, terminalWidth: terminalWidth }, key));
                inCodeBlock = false;
                codeBlockContent = [];
                codeBlockLang = null;
                codeBlockFence = '';
            }
            else {
                codeBlockContent.push(line);
            }
            return;
        }
        const codeFenceMatch = line.match(codeFenceRegex);
        const headerMatch = line.match(headerRegex);
        const ulMatch = line.match(ulItemRegex);
        const olMatch = line.match(olItemRegex);
        const hrMatch = line.match(hrRegex);
        const tableRowMatch = line.match(tableRowRegex);
        const tableSeparatorMatch = line.match(tableSeparatorRegex);
        if (codeFenceMatch) {
            inCodeBlock = true;
            codeBlockFence = codeFenceMatch[1];
            codeBlockLang = codeFenceMatch[2] || null;
        }
        else if (tableRowMatch && !inTable) {
            // Potential table start - check if next line is separator
            if (index + 1 < lines.length &&
                lines[index + 1].match(tableSeparatorRegex)) {
                inTable = true;
                tableHeaders = tableRowMatch[1].split('|').map((cell) => cell.trim());
                tableRows = [];
            }
            else {
                // Not a table, treat as regular text
                addContentBlock(_jsx(Box, { children: _jsx(Text, { wrap: "wrap", color: responseColor, children: _jsx(RenderInline, { text: line, defaultColor: responseColor }) }) }, key));
            }
        }
        else if (inTable && tableSeparatorMatch) {
            // Skip separator line - already handled
        }
        else if (inTable && tableRowMatch) {
            // Add table row
            const cells = tableRowMatch[1].split('|').map((cell) => cell.trim());
            // Ensure row has same column count as headers
            while (cells.length < tableHeaders.length) {
                cells.push('');
            }
            if (cells.length > tableHeaders.length) {
                cells.length = tableHeaders.length;
            }
            tableRows.push(cells);
        }
        else if (inTable && !tableRowMatch) {
            // End of table
            if (tableHeaders.length > 0 && tableRows.length > 0) {
                addContentBlock(_jsx(RenderTable, { headers: tableHeaders, rows: tableRows, terminalWidth: terminalWidth }, `table-${contentBlocks.length}`));
            }
            inTable = false;
            tableRows = [];
            tableHeaders = [];
            // Process current line as normal
            if (line.trim().length > 0) {
                addContentBlock(_jsx(Box, { children: _jsx(Text, { wrap: "wrap", color: responseColor, children: _jsx(RenderInline, { text: line, defaultColor: responseColor }) }) }, key));
            }
        }
        else if (hrMatch) {
            addContentBlock(_jsx(Box, { children: _jsx(Text, { dimColor: true, children: "---" }) }, key));
        }
        else if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = headerMatch[2];
            let headerNode = null;
            switch (level) {
                case 1:
                    headerNode = (_jsx(Text, { bold: true, color: theme.text.link, children: _jsx(RenderInline, { text: headerText, defaultColor: theme.text.link }) }));
                    break;
                case 2:
                    headerNode = (_jsx(Text, { bold: true, color: theme.text.link, children: _jsx(RenderInline, { text: headerText, defaultColor: theme.text.link }) }));
                    break;
                case 3:
                    headerNode = (_jsx(Text, { bold: true, color: responseColor, children: _jsx(RenderInline, { text: headerText, defaultColor: responseColor }) }));
                    break;
                case 4:
                    headerNode = (_jsx(Text, { italic: true, color: theme.text.secondary, children: _jsx(RenderInline, { text: headerText, defaultColor: theme.text.secondary }) }));
                    break;
                default:
                    headerNode = (_jsx(Text, { color: responseColor, children: _jsx(RenderInline, { text: headerText, defaultColor: responseColor }) }));
                    break;
            }
            if (headerNode)
                addContentBlock(_jsx(Box, { children: headerNode }, key));
        }
        else if (ulMatch) {
            const leadingWhitespace = ulMatch[1];
            const marker = ulMatch[2];
            const itemText = ulMatch[3];
            addContentBlock(_jsx(RenderListItem, { itemText: itemText, type: "ul", marker: marker, leadingWhitespace: leadingWhitespace }, key));
        }
        else if (olMatch) {
            const leadingWhitespace = olMatch[1];
            const marker = olMatch[2];
            const itemText = olMatch[3];
            addContentBlock(_jsx(RenderListItem, { itemText: itemText, type: "ol", marker: marker, leadingWhitespace: leadingWhitespace }, key));
        }
        else {
            if (line.trim().length === 0 && !inCodeBlock) {
                if (!lastLineEmpty) {
                    contentBlocks.push(_jsx(Box, { height: EMPTY_LINE_HEIGHT }, `spacer-${index}`));
                    lastLineEmpty = true;
                }
            }
            else {
                addContentBlock(_jsx(Box, { children: _jsx(Text, { wrap: "wrap", color: responseColor, children: _jsx(RenderInline, { text: line, defaultColor: responseColor }) }) }, key));
            }
        }
    });
    if (inCodeBlock) {
        addContentBlock(_jsx(RenderCodeBlock, { content: codeBlockContent, lang: codeBlockLang, isPending: isPending, availableTerminalHeight: isAlternateBuffer ? undefined : availableTerminalHeight, terminalWidth: terminalWidth }, "line-eof"));
    }
    // Handle table at end of content
    if (inTable && tableHeaders.length > 0 && tableRows.length > 0) {
        addContentBlock(_jsx(RenderTable, { headers: tableHeaders, rows: tableRows, terminalWidth: terminalWidth }, `table-${contentBlocks.length}`));
    }
    return _jsx(_Fragment, { children: contentBlocks });
};
const RenderCodeBlockInternal = ({ content, lang, isPending, availableTerminalHeight, terminalWidth, }) => {
    const settings = useSettings();
    const isAlternateBuffer = useAlternateBuffer();
    const MIN_LINES_FOR_MESSAGE = 1; // Minimum lines to show before the "generating more" message
    const RESERVED_LINES = 2; // Lines reserved for the message itself and potential padding
    // When not in alternate buffer mode we need to be careful that we don't
    // trigger flicker when the pending code is to long to fit in the terminal
    if (!isAlternateBuffer &&
        isPending &&
        availableTerminalHeight !== undefined) {
        const MAX_CODE_LINES_WHEN_PENDING = Math.max(0, availableTerminalHeight - RESERVED_LINES);
        if (content.length > MAX_CODE_LINES_WHEN_PENDING) {
            if (MAX_CODE_LINES_WHEN_PENDING < MIN_LINES_FOR_MESSAGE) {
                // Not enough space to even show the message meaningfully
                return (_jsx(Box, { paddingLeft: CODE_BLOCK_PREFIX_PADDING, children: _jsx(Text, { color: theme.text.secondary, children: "... code is being written ..." }) }));
            }
            const truncatedContent = content.slice(0, MAX_CODE_LINES_WHEN_PENDING);
            const colorizedTruncatedCode = colorizeCode({
                code: truncatedContent.join('\n'),
                language: lang,
                availableHeight: availableTerminalHeight,
                maxWidth: terminalWidth - CODE_BLOCK_PREFIX_PADDING,
                settings,
            });
            return (_jsxs(Box, { paddingLeft: CODE_BLOCK_PREFIX_PADDING, flexDirection: "column", children: [colorizedTruncatedCode, _jsx(Text, { color: theme.text.secondary, children: "... generating more ..." })] }));
        }
    }
    const fullContent = content.join('\n');
    const colorizedCode = colorizeCode({
        code: fullContent,
        language: lang,
        availableHeight: isAlternateBuffer ? undefined : availableTerminalHeight,
        maxWidth: terminalWidth - CODE_BLOCK_PREFIX_PADDING,
        settings,
    });
    return (_jsx(Box, { paddingLeft: CODE_BLOCK_PREFIX_PADDING, flexDirection: "column", width: terminalWidth, flexShrink: 0, children: colorizedCode }));
};
const RenderCodeBlock = React.memo(RenderCodeBlockInternal);
const RenderListItemInternal = ({ itemText, type, marker, leadingWhitespace = '', }) => {
    const prefix = type === 'ol' ? `${marker}. ` : `${marker} `;
    const prefixWidth = prefix.length;
    const indentation = leadingWhitespace.length;
    const listResponseColor = theme.text.response ?? theme.text.primary;
    return (_jsxs(Box, { paddingLeft: indentation + LIST_ITEM_PREFIX_PADDING, flexDirection: "row", children: [_jsx(Box, { width: prefixWidth, children: _jsx(Text, { color: listResponseColor, children: prefix }) }), _jsx(Box, { flexGrow: LIST_ITEM_TEXT_FLEX_GROW, children: _jsx(Text, { wrap: "wrap", color: listResponseColor, children: _jsx(RenderInline, { text: itemText, defaultColor: listResponseColor }) }) })] }));
};
const RenderListItem = React.memo(RenderListItemInternal);
const RenderTableInternal = ({ headers, rows, terminalWidth, }) => (_jsx(TableRenderer, { headers: headers, rows: rows, terminalWidth: terminalWidth }));
const RenderTable = React.memo(RenderTableInternal);
export const MarkdownDisplay = React.memo(MarkdownDisplayInternal);
//# sourceMappingURL=MarkdownDisplay.js.map