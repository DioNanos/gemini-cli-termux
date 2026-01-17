import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Text, Box } from 'ink';
import { theme } from '../semantic-colors.js';
import { RenderInline, getPlainTextLength } from './InlineMarkdownRenderer.js';
/**
 * Custom table renderer for markdown tables
 * We implement our own instead of using ink-table due to module compatibility issues
 */
export const TableRenderer = ({ headers, rows, terminalWidth, }) => {
    // Calculate column widths using actual display width after markdown processing
    const columnWidths = headers.map((header, index) => {
        const headerWidth = getPlainTextLength(header);
        const maxRowWidth = Math.max(...rows.map((row) => getPlainTextLength(row[index] || '')));
        return Math.max(headerWidth, maxRowWidth) + 2; // Add padding
    });
    // Ensure table fits within terminal width
    const totalWidth = columnWidths.reduce((sum, width) => sum + width + 1, 1);
    const scaleFactor = totalWidth > terminalWidth ? terminalWidth / totalWidth : 1;
    const adjustedWidths = columnWidths.map((width) => Math.floor(width * scaleFactor));
    // Helper function to render a cell with proper width
    const renderCell = (content, width, isHeader = false) => {
        const contentWidth = Math.max(0, width - 2);
        const displayWidth = getPlainTextLength(content);
        let cellContent = content;
        if (displayWidth > contentWidth) {
            if (contentWidth <= 3) {
                // Just truncate by character count
                cellContent = content.substring(0, Math.min(content.length, contentWidth));
            }
            else {
                // Truncate preserving markdown formatting using binary search
                let left = 0;
                let right = content.length;
                let bestTruncated = content;
                // Binary search to find the optimal truncation point
                while (left <= right) {
                    const mid = Math.floor((left + right) / 2);
                    const candidate = content.substring(0, mid);
                    const candidateWidth = getPlainTextLength(candidate);
                    if (candidateWidth <= contentWidth - 3) {
                        bestTruncated = candidate;
                        left = mid + 1;
                    }
                    else {
                        right = mid - 1;
                    }
                }
                cellContent = bestTruncated + '...';
            }
        }
        // Calculate exact padding needed
        const actualDisplayWidth = getPlainTextLength(cellContent);
        const paddingNeeded = Math.max(0, contentWidth - actualDisplayWidth);
        return (_jsxs(Text, { children: [isHeader ? (_jsx(Text, { bold: true, color: theme.text.link, children: _jsx(RenderInline, { text: cellContent }) })) : (_jsx(RenderInline, { text: cellContent })), ' '.repeat(paddingNeeded)] }));
    };
    // Helper function to render border
    const renderBorder = (type) => {
        const chars = {
            top: { left: '┌', middle: '┬', right: '┐', horizontal: '─' },
            middle: { left: '├', middle: '┼', right: '┤', horizontal: '─' },
            bottom: { left: '└', middle: '┴', right: '┘', horizontal: '─' },
        };
        const char = chars[type];
        const borderParts = adjustedWidths.map((w) => char.horizontal.repeat(w));
        const border = char.left + borderParts.join(char.middle) + char.right;
        return _jsx(Text, { color: theme.border.default, children: border });
    };
    // Helper function to render a table row
    const renderRow = (cells, isHeader = false) => {
        const renderedCells = cells.map((cell, index) => {
            const width = adjustedWidths[index] || 0;
            return renderCell(cell || '', width, isHeader);
        });
        return (_jsxs(Text, { color: theme.text.primary, children: ["\u2502", ' ', renderedCells.map((cell, index) => (_jsxs(React.Fragment, { children: [cell, index < renderedCells.length - 1 ? ' │ ' : ''] }, index))), ' ', "\u2502"] }));
    };
    return (_jsxs(Box, { flexDirection: "column", marginY: 1, children: [renderBorder('top'), renderRow(headers, true), renderBorder('middle'), rows.map((row, index) => (_jsx(React.Fragment, { children: renderRow(row) }, index))), renderBorder('bottom')] }));
};
//# sourceMappingURL=TableRenderer.js.map