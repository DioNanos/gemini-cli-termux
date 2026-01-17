import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Text } from 'ink';
import { theme } from '../semantic-colors.js';
import stringWidth from 'string-width';
import { debugLogger } from '@google/gemini-cli-core';
// Constants for Markdown parsing
const BOLD_MARKER_LENGTH = 2; // For "**"
const ITALIC_MARKER_LENGTH = 1; // For "*" or "_"
const STRIKETHROUGH_MARKER_LENGTH = 2; // For "~~")
const INLINE_CODE_MARKER_LENGTH = 1; // For "`"
const UNDERLINE_TAG_START_LENGTH = 3; // For "<u>"
const UNDERLINE_TAG_END_LENGTH = 4; // For "</u>"
const RenderInlineInternal = ({ text, defaultColor, }) => {
    const baseColor = defaultColor ?? theme.text.primary;
    // Early return for plain text without markdown or URLs
    if (!/[*_~`<[https?:]/.test(text)) {
        return _jsx(Text, { color: baseColor, children: text });
    }
    const nodes = [];
    let lastIndex = 0;
    const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|_.*?_|~~.*?~~|\[.*?\]\(.*?\)|`+.+?`+|<u>.*?<\/u>|https?:\/\/\S+)/g;
    let match;
    while ((match = inlineRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(_jsx(Text, { color: baseColor, children: text.slice(lastIndex, match.index) }, `t-${lastIndex}`));
        }
        const fullMatch = match[0];
        let renderedNode = null;
        const key = `m-${match.index}`;
        try {
            if (fullMatch.startsWith('**') &&
                fullMatch.endsWith('**') &&
                fullMatch.length > BOLD_MARKER_LENGTH * 2) {
                renderedNode = (_jsx(Text, { bold: true, color: baseColor, children: fullMatch.slice(BOLD_MARKER_LENGTH, -BOLD_MARKER_LENGTH) }, key));
            }
            else if (fullMatch.length > ITALIC_MARKER_LENGTH * 2 &&
                ((fullMatch.startsWith('*') && fullMatch.endsWith('*')) ||
                    (fullMatch.startsWith('_') && fullMatch.endsWith('_'))) &&
                !/\w/.test(text.substring(match.index - 1, match.index)) &&
                !/\w/.test(text.substring(inlineRegex.lastIndex, inlineRegex.lastIndex + 1)) &&
                !/\S[./\\]/.test(text.substring(match.index - 2, match.index)) &&
                !/[./\\]\S/.test(text.substring(inlineRegex.lastIndex, inlineRegex.lastIndex + 2))) {
                renderedNode = (_jsx(Text, { italic: true, color: baseColor, children: fullMatch.slice(ITALIC_MARKER_LENGTH, -ITALIC_MARKER_LENGTH) }, key));
            }
            else if (fullMatch.startsWith('~~') &&
                fullMatch.endsWith('~~') &&
                fullMatch.length > STRIKETHROUGH_MARKER_LENGTH * 2) {
                renderedNode = (_jsx(Text, { strikethrough: true, color: baseColor, children: fullMatch.slice(STRIKETHROUGH_MARKER_LENGTH, -STRIKETHROUGH_MARKER_LENGTH) }, key));
            }
            else if (fullMatch.startsWith('`') &&
                fullMatch.endsWith('`') &&
                fullMatch.length > INLINE_CODE_MARKER_LENGTH) {
                const codeMatch = fullMatch.match(/^(`+)(.+?)\1$/s);
                if (codeMatch && codeMatch[2]) {
                    renderedNode = (_jsx(Text, { color: theme.text.accent, children: codeMatch[2] }, key));
                }
            }
            else if (fullMatch.startsWith('[') &&
                fullMatch.includes('](') &&
                fullMatch.endsWith(')')) {
                const linkMatch = fullMatch.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    const linkText = linkMatch[1];
                    const url = linkMatch[2];
                    renderedNode = (_jsxs(Text, { color: baseColor, children: [linkText, _jsxs(Text, { color: theme.text.link, children: [" (", url, ")"] })] }, key));
                }
            }
            else if (fullMatch.startsWith('<u>') &&
                fullMatch.endsWith('</u>') &&
                fullMatch.length >
                    UNDERLINE_TAG_START_LENGTH + UNDERLINE_TAG_END_LENGTH - 1 // -1 because length is compared to combined length of start and end tags
            ) {
                renderedNode = (_jsx(Text, { underline: true, color: baseColor, children: fullMatch.slice(UNDERLINE_TAG_START_LENGTH, -UNDERLINE_TAG_END_LENGTH) }, key));
            }
            else if (fullMatch.match(/^https?:\/\//)) {
                renderedNode = (_jsx(Text, { color: theme.text.link, children: fullMatch }, key));
            }
        }
        catch (e) {
            debugLogger.warn('Error parsing inline markdown part:', fullMatch, e);
            renderedNode = null;
        }
        nodes.push(renderedNode ?? (_jsx(Text, { color: baseColor, children: fullMatch }, key)));
        lastIndex = inlineRegex.lastIndex;
    }
    if (lastIndex < text.length) {
        nodes.push(_jsx(Text, { color: baseColor, children: text.slice(lastIndex) }, `t-${lastIndex}`));
    }
    return _jsx(_Fragment, { children: nodes.filter((node) => node !== null) });
};
export const RenderInline = React.memo(RenderInlineInternal);
/**
 * Utility function to get the plain text length of a string with markdown formatting
 * This is useful for calculating column widths in tables
 */
export const getPlainTextLength = (text) => {
    const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/<u>(.*?)<\/u>/g, '$1')
        .replace(/.*\[(.*?)\]\(.*\)/g, '$1');
    return stringWidth(cleanText);
};
//# sourceMappingURL=InlineMarkdownRenderer.js.map