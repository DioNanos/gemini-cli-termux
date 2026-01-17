/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import pathMod from 'node:path';
import * as path from 'node:path';
import { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { LRUCache } from 'mnemonist';
import { coreEvents, CoreEvent, debugLogger, unescapePath, getEditorCommand, isGuiEditor, } from '@google/gemini-cli-core';
import { toCodePoints, cpLen, cpSlice, stripUnsafeCharacters, getCachedStringWidth, } from '../../utils/textUtils.js';
import { parsePastedPaths } from '../../utils/clipboardUtils.js';
import { keyMatchers, Command } from '../../keyMatchers.js';
import { handleVimAction } from './vim-buffer-actions.js';
import { LRU_BUFFER_PERF_CACHE_LIMIT } from '../../constants.js';
// Helper functions for line-based word navigation
export const isWordCharStrict = (char) => /[\w\p{L}\p{N}]/u.test(char); // Matches a single character that is any Unicode letter, any Unicode number, or an underscore
export const isWhitespace = (char) => /\s/.test(char);
// Check if a character is a combining mark (only diacritics for now)
export const isCombiningMark = (char) => /\p{M}/u.test(char);
// Check if a character should be considered part of a word (including combining marks)
export const isWordCharWithCombining = (char) => isWordCharStrict(char) || isCombiningMark(char);
// Get the script of a character (simplified for common scripts)
export const getCharScript = (char) => {
    if (/[\p{Script=Latin}]/u.test(char))
        return 'latin'; // All Latin script chars including diacritics
    if (/[\p{Script=Han}]/u.test(char))
        return 'han'; // Chinese
    if (/[\p{Script=Arabic}]/u.test(char))
        return 'arabic';
    if (/[\p{Script=Hiragana}]/u.test(char))
        return 'hiragana';
    if (/[\p{Script=Katakana}]/u.test(char))
        return 'katakana';
    if (/[\p{Script=Cyrillic}]/u.test(char))
        return 'cyrillic';
    return 'other';
};
// Check if two characters are from different scripts (indicating word boundary)
export const isDifferentScript = (char1, char2) => {
    if (!isWordCharStrict(char1) || !isWordCharStrict(char2))
        return false;
    return getCharScript(char1) !== getCharScript(char2);
};
// Find next word start within a line, starting from col
export const findNextWordStartInLine = (line, col) => {
    const chars = toCodePoints(line);
    let i = col;
    if (i >= chars.length)
        return null;
    const currentChar = chars[i];
    // Skip current word/sequence based on character type
    if (isWordCharStrict(currentChar)) {
        while (i < chars.length && isWordCharWithCombining(chars[i])) {
            // Check for script boundary - if next character is from different script, stop here
            if (i + 1 < chars.length &&
                isWordCharStrict(chars[i + 1]) &&
                isDifferentScript(chars[i], chars[i + 1])) {
                i++; // Include current character
                break; // Stop at script boundary
            }
            i++;
        }
    }
    else if (!isWhitespace(currentChar)) {
        while (i < chars.length &&
            !isWordCharStrict(chars[i]) &&
            !isWhitespace(chars[i])) {
            i++;
        }
    }
    // Skip whitespace
    while (i < chars.length && isWhitespace(chars[i])) {
        i++;
    }
    return i < chars.length ? i : null;
};
// Find previous word start within a line
export const findPrevWordStartInLine = (line, col) => {
    const chars = toCodePoints(line);
    let i = col;
    if (i <= 0)
        return null;
    i--;
    // Skip whitespace moving backwards
    while (i >= 0 && isWhitespace(chars[i])) {
        i--;
    }
    if (i < 0)
        return null;
    if (isWordCharStrict(chars[i])) {
        // We're in a word, move to its beginning
        while (i >= 0 && isWordCharStrict(chars[i])) {
            // Check for script boundary - if previous character is from different script, stop here
            if (i - 1 >= 0 &&
                isWordCharStrict(chars[i - 1]) &&
                isDifferentScript(chars[i], chars[i - 1])) {
                return i; // Return current position at script boundary
            }
            i--;
        }
        return i + 1;
    }
    else {
        // We're in punctuation, move to its beginning
        while (i >= 0 && !isWordCharStrict(chars[i]) && !isWhitespace(chars[i])) {
            i--;
        }
        return i + 1;
    }
};
// Find word end within a line
export const findWordEndInLine = (line, col) => {
    const chars = toCodePoints(line);
    let i = col;
    // If we're already at the end of a word (including punctuation sequences), advance to next word
    // This includes both regular word endings and script boundaries
    const atEndOfWordChar = i < chars.length &&
        isWordCharWithCombining(chars[i]) &&
        (i + 1 >= chars.length ||
            !isWordCharWithCombining(chars[i + 1]) ||
            (isWordCharStrict(chars[i]) &&
                i + 1 < chars.length &&
                isWordCharStrict(chars[i + 1]) &&
                isDifferentScript(chars[i], chars[i + 1])));
    const atEndOfPunctuation = i < chars.length &&
        !isWordCharWithCombining(chars[i]) &&
        !isWhitespace(chars[i]) &&
        (i + 1 >= chars.length ||
            isWhitespace(chars[i + 1]) ||
            isWordCharWithCombining(chars[i + 1]));
    if (atEndOfWordChar || atEndOfPunctuation) {
        // We're at the end of a word or punctuation sequence, move forward to find next word
        i++;
        // Skip whitespace to find next word or punctuation
        while (i < chars.length && isWhitespace(chars[i])) {
            i++;
        }
    }
    // If we're not on a word character, find the next word or punctuation sequence
    if (i < chars.length && !isWordCharWithCombining(chars[i])) {
        // Skip whitespace to find next word or punctuation
        while (i < chars.length && isWhitespace(chars[i])) {
            i++;
        }
    }
    // Move to end of current word (including combining marks, but stop at script boundaries)
    let foundWord = false;
    let lastBaseCharPos = -1;
    if (i < chars.length && isWordCharWithCombining(chars[i])) {
        // Handle word characters
        while (i < chars.length && isWordCharWithCombining(chars[i])) {
            foundWord = true;
            // Track the position of the last base character (not combining mark)
            if (isWordCharStrict(chars[i])) {
                lastBaseCharPos = i;
            }
            // Check if next character is from a different script (word boundary)
            if (i + 1 < chars.length &&
                isWordCharStrict(chars[i + 1]) &&
                isDifferentScript(chars[i], chars[i + 1])) {
                i++; // Include current character
                if (isWordCharStrict(chars[i - 1])) {
                    lastBaseCharPos = i - 1;
                }
                break; // Stop at script boundary
            }
            i++;
        }
    }
    else if (i < chars.length && !isWhitespace(chars[i])) {
        // Handle punctuation sequences (like ████)
        while (i < chars.length &&
            !isWordCharStrict(chars[i]) &&
            !isWhitespace(chars[i])) {
            foundWord = true;
            lastBaseCharPos = i;
            i++;
        }
    }
    // Only return a position if we actually found a word
    // Return the position of the last base character, not combining marks
    if (foundWord && lastBaseCharPos >= col) {
        return lastBaseCharPos;
    }
    return null;
};
// Initialize segmenter for word boundary detection
const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
function findPrevWordBoundary(line, cursorCol) {
    const codePoints = toCodePoints(line);
    // Convert cursorCol (CP index) to string index
    const prefix = codePoints.slice(0, cursorCol).join('');
    const cursorIdx = prefix.length;
    let targetIdx = 0;
    for (const seg of segmenter.segment(line)) {
        // We want the last word start strictly before the cursor.
        // If we've reached or passed the cursor, we stop.
        if (seg.index >= cursorIdx)
            break;
        if (seg.isWordLike) {
            targetIdx = seg.index;
        }
    }
    return toCodePoints(line.slice(0, targetIdx)).length;
}
function findNextWordBoundary(line, cursorCol) {
    const codePoints = toCodePoints(line);
    const prefix = codePoints.slice(0, cursorCol).join('');
    const cursorIdx = prefix.length;
    let targetIdx = line.length;
    for (const seg of segmenter.segment(line)) {
        const segEnd = seg.index + seg.segment.length;
        if (segEnd > cursorIdx) {
            if (seg.isWordLike) {
                targetIdx = segEnd;
                break;
            }
        }
    }
    return toCodePoints(line.slice(0, targetIdx)).length;
}
// Find next word across lines
export const findNextWordAcrossLines = (lines, cursorRow, cursorCol, searchForWordStart) => {
    // First try current line
    const currentLine = lines[cursorRow] || '';
    const colInCurrentLine = searchForWordStart
        ? findNextWordStartInLine(currentLine, cursorCol)
        : findWordEndInLine(currentLine, cursorCol);
    if (colInCurrentLine !== null) {
        return { row: cursorRow, col: colInCurrentLine };
    }
    // Search subsequent lines
    for (let row = cursorRow + 1; row < lines.length; row++) {
        const line = lines[row] || '';
        const chars = toCodePoints(line);
        // For empty lines, if we haven't found any words yet, return the empty line
        if (chars.length === 0) {
            // Check if there are any words in remaining lines
            let hasWordsInLaterLines = false;
            for (let laterRow = row + 1; laterRow < lines.length; laterRow++) {
                const laterLine = lines[laterRow] || '';
                const laterChars = toCodePoints(laterLine);
                let firstNonWhitespace = 0;
                while (firstNonWhitespace < laterChars.length &&
                    isWhitespace(laterChars[firstNonWhitespace])) {
                    firstNonWhitespace++;
                }
                if (firstNonWhitespace < laterChars.length) {
                    hasWordsInLaterLines = true;
                    break;
                }
            }
            // If no words in later lines, return the empty line
            if (!hasWordsInLaterLines) {
                return { row, col: 0 };
            }
            continue;
        }
        // Find first non-whitespace
        let firstNonWhitespace = 0;
        while (firstNonWhitespace < chars.length &&
            isWhitespace(chars[firstNonWhitespace])) {
            firstNonWhitespace++;
        }
        if (firstNonWhitespace < chars.length) {
            if (searchForWordStart) {
                return { row, col: firstNonWhitespace };
            }
            else {
                // For word end, find the end of the first word
                const endCol = findWordEndInLine(line, firstNonWhitespace);
                if (endCol !== null) {
                    return { row, col: endCol };
                }
            }
        }
    }
    return null;
};
// Find previous word across lines
export const findPrevWordAcrossLines = (lines, cursorRow, cursorCol) => {
    // First try current line
    const currentLine = lines[cursorRow] || '';
    const colInCurrentLine = findPrevWordStartInLine(currentLine, cursorCol);
    if (colInCurrentLine !== null) {
        return { row: cursorRow, col: colInCurrentLine };
    }
    // Search previous lines
    for (let row = cursorRow - 1; row >= 0; row--) {
        const line = lines[row] || '';
        const chars = toCodePoints(line);
        if (chars.length === 0)
            continue;
        // Find last word start
        let lastWordStart = chars.length;
        while (lastWordStart > 0 && isWhitespace(chars[lastWordStart - 1])) {
            lastWordStart--;
        }
        if (lastWordStart > 0) {
            // Find start of this word
            const wordStart = findPrevWordStartInLine(line, lastWordStart);
            if (wordStart !== null) {
                return { row, col: wordStart };
            }
        }
    }
    return null;
};
// Helper functions for vim line operations
export const getPositionFromOffsets = (startOffset, endOffset, lines) => {
    let offset = 0;
    let startRow = 0;
    let startCol = 0;
    let endRow = 0;
    let endCol = 0;
    // Find start position
    for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for newline
        if (offset + lineLength > startOffset) {
            startRow = i;
            startCol = startOffset - offset;
            break;
        }
        offset += lineLength;
    }
    // Find end position
    offset = 0;
    for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + (i < lines.length - 1 ? 1 : 0); // +1 for newline except last line
        if (offset + lineLength >= endOffset) {
            endRow = i;
            endCol = endOffset - offset;
            break;
        }
        offset += lineLength;
    }
    return { startRow, startCol, endRow, endCol };
};
export const getLineRangeOffsets = (startRow, lineCount, lines) => {
    let startOffset = 0;
    // Calculate start offset
    for (let i = 0; i < startRow; i++) {
        startOffset += lines[i].length + 1; // +1 for newline
    }
    // Calculate end offset
    let endOffset = startOffset;
    for (let i = 0; i < lineCount; i++) {
        const lineIndex = startRow + i;
        if (lineIndex < lines.length) {
            endOffset += lines[lineIndex].length;
            if (lineIndex < lines.length - 1) {
                endOffset += 1; // +1 for newline
            }
        }
    }
    return { startOffset, endOffset };
};
export const replaceRangeInternal = (state, startRow, startCol, endRow, endCol, text) => {
    const currentLine = (row) => state.lines[row] || '';
    const currentLineLen = (row) => cpLen(currentLine(row));
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    if (startRow > endRow ||
        (startRow === endRow && startCol > endCol) ||
        startRow < 0 ||
        startCol < 0 ||
        endRow >= state.lines.length ||
        (endRow < state.lines.length && endCol > currentLineLen(endRow))) {
        return state; // Invalid range
    }
    const newLines = [...state.lines];
    const sCol = clamp(startCol, 0, currentLineLen(startRow));
    const eCol = clamp(endCol, 0, currentLineLen(endRow));
    const prefix = cpSlice(currentLine(startRow), 0, sCol);
    const suffix = cpSlice(currentLine(endRow), eCol);
    const normalisedReplacement = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
    const replacementParts = normalisedReplacement.split('\n');
    // The combined first line of the new text
    const firstLine = prefix + replacementParts[0];
    if (replacementParts.length === 1) {
        // No newlines in replacement: combine prefix, replacement, and suffix on one line.
        newLines.splice(startRow, endRow - startRow + 1, firstLine + suffix);
    }
    else {
        // Newlines in replacement: create new lines.
        const lastLine = replacementParts[replacementParts.length - 1] + suffix;
        const middleLines = replacementParts.slice(1, -1);
        newLines.splice(startRow, endRow - startRow + 1, firstLine, ...middleLines, lastLine);
    }
    const finalCursorRow = startRow + replacementParts.length - 1;
    const finalCursorCol = (replacementParts.length > 1 ? 0 : sCol) +
        cpLen(replacementParts[replacementParts.length - 1]);
    return {
        ...state,
        lines: newLines,
        cursorRow: Math.min(Math.max(finalCursorRow, 0), newLines.length - 1),
        cursorCol: Math.max(0, Math.min(finalCursorCol, cpLen(newLines[finalCursorRow] || ''))),
        preferredCol: null,
    };
};
function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}
function calculateInitialCursorPosition(initialLines, offset) {
    let remainingChars = offset;
    let row = 0;
    while (row < initialLines.length) {
        const lineLength = cpLen(initialLines[row]);
        // Add 1 for the newline character (except for the last line)
        const totalCharsInLineAndNewline = lineLength + (row < initialLines.length - 1 ? 1 : 0);
        if (remainingChars <= lineLength) {
            // Cursor is on this line
            return [row, remainingChars];
        }
        remainingChars -= totalCharsInLineAndNewline;
        row++;
    }
    // Offset is beyond the text, place cursor at the end of the last line
    if (initialLines.length > 0) {
        const lastRow = initialLines.length - 1;
        return [lastRow, cpLen(initialLines[lastRow])];
    }
    return [0, 0]; // Default for empty text
}
export function offsetToLogicalPos(text, offset) {
    let row = 0;
    let col = 0;
    let currentOffset = 0;
    if (offset === 0)
        return [0, 0];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = cpLen(line);
        const lineLengthWithNewline = lineLength + (i < lines.length - 1 ? 1 : 0);
        if (offset <= currentOffset + lineLength) {
            // Check against lineLength first
            row = i;
            col = offset - currentOffset;
            return [row, col];
        }
        else if (offset <= currentOffset + lineLengthWithNewline) {
            // Check if offset is the newline itself
            row = i;
            col = lineLength; // Position cursor at the end of the current line content
            // If the offset IS the newline, and it's not the last line, advance to next line, col 0
            if (offset === currentOffset + lineLengthWithNewline &&
                i < lines.length - 1) {
                return [i + 1, 0];
            }
            return [row, col]; // Otherwise, it's at the end of the current line content
        }
        currentOffset += lineLengthWithNewline;
    }
    // If offset is beyond the text length, place cursor at the end of the last line
    // or [0,0] if text is empty
    if (lines.length > 0) {
        row = lines.length - 1;
        col = cpLen(lines[row]);
    }
    else {
        row = 0;
        col = 0;
    }
    return [row, col];
}
/**
 * Converts logical row/col position to absolute text offset
 * Inverse operation of offsetToLogicalPos
 */
export function logicalPosToOffset(lines, row, col) {
    let offset = 0;
    // Clamp row to valid range
    const actualRow = Math.min(row, lines.length - 1);
    // Add lengths of all lines before the target row
    for (let i = 0; i < actualRow; i++) {
        offset += cpLen(lines[i]) + 1; // +1 for newline
    }
    // Add column offset within the target row
    if (actualRow >= 0 && actualRow < lines.length) {
        offset += Math.min(col, cpLen(lines[actualRow]));
    }
    return offset;
}
export const imagePathRegex = /@((?:\\.|[^\s\r\n\\])+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))\b/gi;
export function getTransformedImagePath(filePath) {
    const raw = filePath;
    // Ignore leading @ when stripping directories, but keep it for simple '@file.png'
    const withoutAt = raw.startsWith('@') ? raw.slice(1) : raw;
    // Unescape the path to handle escaped spaces and other characters
    const unescaped = unescapePath(withoutAt);
    // Find last directory separator, supporting both POSIX and Windows styles
    const lastSepIndex = Math.max(unescaped.lastIndexOf('/'), unescaped.lastIndexOf('\\'));
    // If we saw a separator, take the segment after it; otherwise fall back to the unescaped string
    const fileName = lastSepIndex >= 0 ? unescaped.slice(lastSepIndex + 1) : unescaped;
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    const maxBaseLength = 10;
    const truncatedBase = baseName.length > maxBaseLength
        ? `...${baseName.slice(-maxBaseLength)}`
        : baseName;
    return `[Image ${truncatedBase}${extension}]`;
}
const transformationsCache = new LRUCache(LRU_BUFFER_PERF_CACHE_LIMIT);
export function calculateTransformationsForLine(line) {
    const cached = transformationsCache.get(line);
    if (cached) {
        return cached;
    }
    const transformations = [];
    let match;
    // Reset regex state to ensure clean matching from start of line
    imagePathRegex.lastIndex = 0;
    while ((match = imagePathRegex.exec(line)) !== null) {
        const logicalText = match[0];
        const logStart = cpLen(line.substring(0, match.index));
        const logEnd = logStart + cpLen(logicalText);
        transformations.push({
            logStart,
            logEnd,
            logicalText,
            collapsedText: getTransformedImagePath(logicalText),
        });
    }
    transformationsCache.set(line, transformations);
    return transformations;
}
export function calculateTransformations(lines) {
    return lines.map((ln) => calculateTransformationsForLine(ln));
}
export function getTransformUnderCursor(row, col, spansByLine) {
    const spans = spansByLine[row];
    if (!spans || spans.length === 0)
        return null;
    for (const span of spans) {
        if (col >= span.logStart && col <= span.logEnd) {
            return span;
        }
        if (col < span.logStart)
            break;
    }
    return null;
}
export function calculateTransformedLine(logLine, logIndex, logicalCursor, transformations) {
    let transformedLine = '';
    const transformedToLogMap = [];
    let lastLogPos = 0;
    const cursorIsOnThisLine = logIndex === logicalCursor[0];
    const cursorCol = logicalCursor[1];
    for (const transform of transformations) {
        const textBeforeTransformation = cpSlice(logLine, lastLogPos, transform.logStart);
        transformedLine += textBeforeTransformation;
        for (let i = 0; i < cpLen(textBeforeTransformation); i++) {
            transformedToLogMap.push(lastLogPos + i);
        }
        const isExpanded = cursorIsOnThisLine &&
            cursorCol >= transform.logStart &&
            cursorCol <= transform.logEnd;
        const transformedText = isExpanded
            ? transform.logicalText
            : transform.collapsedText;
        transformedLine += transformedText;
        // Map transformed characters back to logical characters
        const transformedLen = cpLen(transformedText);
        if (isExpanded) {
            for (let i = 0; i < transformedLen; i++) {
                transformedToLogMap.push(transform.logStart + i);
            }
        }
        else {
            // Collapsed: distribute transformed positions monotonically across the raw span.
            // This preserves ordering across wrapped slices so logicalToVisualMap has
            // increasing startColInLogical and visual cursor mapping remains consistent.
            const logicalLength = Math.max(0, transform.logEnd - transform.logStart);
            for (let i = 0; i < transformedLen; i++) {
                // Map the i-th transformed code point into [logStart, logEnd)
                const transformationToLogicalOffset = logicalLength === 0
                    ? 0
                    : Math.floor((i * logicalLength) / transformedLen);
                const transformationToLogicalIndex = transform.logStart +
                    Math.min(transformationToLogicalOffset, Math.max(logicalLength - 1, 0));
                transformedToLogMap.push(transformationToLogicalIndex);
            }
        }
        lastLogPos = transform.logEnd;
    }
    // Append text after last transform
    const remainingUntransformedText = cpSlice(logLine, lastLogPos);
    transformedLine += remainingUntransformedText;
    for (let i = 0; i < cpLen(remainingUntransformedText); i++) {
        transformedToLogMap.push(lastLogPos + i);
    }
    // For a cursor at the very end of the transformed line
    transformedToLogMap.push(cpLen(logLine));
    return { transformedLine, transformedToLogMap };
}
const lineLayoutCache = new LRUCache(LRU_BUFFER_PERF_CACHE_LIMIT);
function getLineLayoutCacheKey(line, viewportWidth, isCursorOnLine, cursorCol) {
    // Most lines (99.9% in a large buffer) are not cursor lines.
    // We use a simpler key for them to reduce string allocation overhead.
    if (!isCursorOnLine) {
        return `${viewportWidth}:N:${line}`;
    }
    return `${viewportWidth}:C:${cursorCol}:${line}`;
}
// Calculates the visual wrapping of lines and the mapping between logical and visual coordinates.
// This is an expensive operation and should be memoized.
function calculateLayout(logicalLines, viewportWidth, logicalCursor) {
    const visualLines = [];
    const logicalToVisualMap = [];
    const visualToLogicalMap = [];
    const transformedToLogicalMaps = [];
    const visualToTransformedMap = [];
    logicalLines.forEach((logLine, logIndex) => {
        logicalToVisualMap[logIndex] = [];
        const isCursorOnLine = logIndex === logicalCursor[0];
        const cacheKey = getLineLayoutCacheKey(logLine, viewportWidth, isCursorOnLine, logicalCursor[1]);
        const cached = lineLayoutCache.get(cacheKey);
        if (cached) {
            const visualLineOffset = visualLines.length;
            visualLines.push(...cached.visualLines);
            cached.logicalToVisualMap.forEach(([relVisualIdx, logCol]) => {
                logicalToVisualMap[logIndex].push([
                    visualLineOffset + relVisualIdx,
                    logCol,
                ]);
            });
            cached.visualToLogicalMap.forEach(([, logCol]) => {
                visualToLogicalMap.push([logIndex, logCol]);
            });
            transformedToLogicalMaps[logIndex] = cached.transformedToLogMap;
            visualToTransformedMap.push(...cached.visualToTransformedMap);
            return;
        }
        // Not in cache, calculate
        const transformations = calculateTransformationsForLine(logLine);
        const { transformedLine, transformedToLogMap } = calculateTransformedLine(logLine, logIndex, logicalCursor, transformations);
        const lineVisualLines = [];
        const lineLogicalToVisualMap = [];
        const lineVisualToLogicalMap = [];
        const lineVisualToTransformedMap = [];
        if (transformedLine.length === 0) {
            // Handle empty logical line
            lineLogicalToVisualMap.push([0, 0]);
            lineVisualToLogicalMap.push([logIndex, 0]);
            lineVisualToTransformedMap.push(0);
            lineVisualLines.push('');
        }
        else {
            // Non-empty logical line
            let currentPosInLogLine = 0; // Tracks position within the current logical line (code point index)
            const codePointsInLogLine = toCodePoints(transformedLine);
            while (currentPosInLogLine < codePointsInLogLine.length) {
                let currentChunk = '';
                let currentChunkVisualWidth = 0;
                let numCodePointsInChunk = 0;
                let lastWordBreakPoint = -1; // Index in codePointsInLogLine for word break
                let numCodePointsAtLastWordBreak = 0;
                // Iterate through code points to build the current visual line (chunk)
                for (let i = currentPosInLogLine; i < codePointsInLogLine.length; i++) {
                    const char = codePointsInLogLine[i];
                    const charVisualWidth = getCachedStringWidth(char);
                    if (currentChunkVisualWidth + charVisualWidth > viewportWidth) {
                        // Character would exceed viewport width
                        if (lastWordBreakPoint !== -1 &&
                            numCodePointsAtLastWordBreak > 0 &&
                            currentPosInLogLine + numCodePointsAtLastWordBreak < i) {
                            // We have a valid word break point to use, and it's not the start of the current segment
                            currentChunk = codePointsInLogLine
                                .slice(currentPosInLogLine, currentPosInLogLine + numCodePointsAtLastWordBreak)
                                .join('');
                            numCodePointsInChunk = numCodePointsAtLastWordBreak;
                        }
                        else {
                            // No word break, or word break is at the start of this potential chunk, or word break leads to empty chunk.
                            // Hard break: take characters up to viewportWidth, or just the current char if it alone is too wide.
                            if (numCodePointsInChunk === 0 &&
                                charVisualWidth > viewportWidth) {
                                // Single character is wider than viewport, take it anyway
                                currentChunk = char;
                                numCodePointsInChunk = 1;
                            }
                        }
                        break; // Break from inner loop to finalize this chunk
                    }
                    currentChunk += char;
                    currentChunkVisualWidth += charVisualWidth;
                    numCodePointsInChunk++;
                    // Check for word break opportunity (space)
                    if (char === ' ') {
                        lastWordBreakPoint = i; // Store code point index of the space
                        // Store the state *before* adding the space, if we decide to break here.
                        numCodePointsAtLastWordBreak = numCodePointsInChunk - 1; // Chars *before* the space
                    }
                }
                if (numCodePointsInChunk === 0 &&
                    currentPosInLogLine < codePointsInLogLine.length) {
                    const firstChar = codePointsInLogLine[currentPosInLogLine];
                    currentChunk = firstChar;
                    numCodePointsInChunk = 1;
                }
                const logicalStartCol = transformedToLogMap[currentPosInLogLine] ?? 0;
                lineLogicalToVisualMap.push([lineVisualLines.length, logicalStartCol]);
                lineVisualToLogicalMap.push([logIndex, logicalStartCol]);
                lineVisualToTransformedMap.push(currentPosInLogLine);
                lineVisualLines.push(currentChunk);
                const logicalStartOfThisChunk = currentPosInLogLine;
                currentPosInLogLine += numCodePointsInChunk;
                if (logicalStartOfThisChunk + numCodePointsInChunk <
                    codePointsInLogLine.length &&
                    currentPosInLogLine < codePointsInLogLine.length &&
                    codePointsInLogLine[currentPosInLogLine] === ' ') {
                    currentPosInLogLine++;
                }
            }
        }
        // Cache the result for this line
        lineLayoutCache.set(cacheKey, {
            visualLines: lineVisualLines,
            logicalToVisualMap: lineLogicalToVisualMap,
            visualToLogicalMap: lineVisualToLogicalMap,
            transformedToLogMap,
            visualToTransformedMap: lineVisualToTransformedMap,
        });
        const visualLineOffset = visualLines.length;
        visualLines.push(...lineVisualLines);
        lineLogicalToVisualMap.forEach(([relVisualIdx, logCol]) => {
            logicalToVisualMap[logIndex].push([
                visualLineOffset + relVisualIdx,
                logCol,
            ]);
        });
        lineVisualToLogicalMap.forEach(([, logCol]) => {
            visualToLogicalMap.push([logIndex, logCol]);
        });
        transformedToLogicalMaps[logIndex] = transformedToLogMap;
        visualToTransformedMap.push(...lineVisualToTransformedMap);
    });
    // If the entire logical text was empty, ensure there's one empty visual line.
    if (logicalLines.length === 0 ||
        (logicalLines.length === 1 && logicalLines[0] === '')) {
        if (visualLines.length === 0) {
            visualLines.push('');
            if (!logicalToVisualMap[0])
                logicalToVisualMap[0] = [];
            logicalToVisualMap[0].push([0, 0]);
            visualToLogicalMap.push([0, 0]);
            visualToTransformedMap.push(0);
        }
    }
    return {
        visualLines,
        logicalToVisualMap,
        visualToLogicalMap,
        transformedToLogicalMaps,
        visualToTransformedMap,
    };
}
// Calculates the visual cursor position based on a pre-calculated layout.
// This is a lightweight operation.
function calculateVisualCursorFromLayout(layout, logicalCursor) {
    const { logicalToVisualMap, visualLines, transformedToLogicalMaps } = layout;
    const [logicalRow, logicalCol] = logicalCursor;
    const segmentsForLogicalLine = logicalToVisualMap[logicalRow];
    if (!segmentsForLogicalLine || segmentsForLogicalLine.length === 0) {
        // This can happen for an empty document.
        return [0, 0];
    }
    // Find the segment where the logical column fits.
    // The segments are sorted by startColInLogical.
    let targetSegmentIndex = segmentsForLogicalLine.findIndex(([, startColInLogical], index) => {
        const nextStartColInLogical = index + 1 < segmentsForLogicalLine.length
            ? segmentsForLogicalLine[index + 1][1]
            : Infinity;
        return (logicalCol >= startColInLogical && logicalCol < nextStartColInLogical);
    });
    // If not found, it means the cursor is at the end of the logical line.
    if (targetSegmentIndex === -1) {
        if (logicalCol === 0) {
            targetSegmentIndex = 0;
        }
        else {
            targetSegmentIndex = segmentsForLogicalLine.length - 1;
        }
    }
    const [visualRow, startColInLogical] = segmentsForLogicalLine[targetSegmentIndex];
    // Find the coordinates in transformed space in order to conver to visual
    const transformedToLogicalMap = transformedToLogicalMaps[logicalRow] ?? [];
    let transformedCol = 0;
    for (let i = 0; i < transformedToLogicalMap.length; i++) {
        if (transformedToLogicalMap[i] > logicalCol) {
            transformedCol = Math.max(0, i - 1);
            break;
        }
        if (i === transformedToLogicalMap.length - 1) {
            transformedCol = transformedToLogicalMap.length - 1;
        }
    }
    let startColInTransformed = 0;
    while (startColInTransformed < transformedToLogicalMap.length &&
        transformedToLogicalMap[startColInTransformed] < startColInLogical) {
        startColInTransformed++;
    }
    const clampedTransformedCol = Math.min(transformedCol, Math.max(0, transformedToLogicalMap.length - 1));
    const visualCol = clampedTransformedCol - startColInTransformed;
    const clampedVisualCol = Math.min(Math.max(visualCol, 0), cpLen(visualLines[visualRow] ?? ''));
    return [visualRow, clampedVisualCol];
}
const historyLimit = 100;
export const pushUndo = (currentState) => {
    const snapshot = {
        lines: [...currentState.lines],
        cursorRow: currentState.cursorRow,
        cursorCol: currentState.cursorCol,
    };
    const newStack = [...currentState.undoStack, snapshot];
    if (newStack.length > historyLimit) {
        newStack.shift();
    }
    return { ...currentState, undoStack: newStack, redoStack: [] };
};
function textBufferReducerLogic(state, action, options = {}) {
    const pushUndoLocal = pushUndo;
    const currentLine = (r) => state.lines[r] ?? '';
    const currentLineLen = (r) => cpLen(currentLine(r));
    switch (action.type) {
        case 'set_text': {
            let nextState = state;
            if (action.pushToUndo !== false) {
                nextState = pushUndoLocal(state);
            }
            const newContentLines = action.payload
                .replace(/\r\n?/g, '\n')
                .split('\n');
            const lines = newContentLines.length === 0 ? [''] : newContentLines;
            const lastNewLineIndex = lines.length - 1;
            return {
                ...nextState,
                lines,
                cursorRow: lastNewLineIndex,
                cursorCol: cpLen(lines[lastNewLineIndex] ?? ''),
                preferredCol: null,
            };
        }
        case 'insert': {
            const nextState = pushUndoLocal(state);
            const newLines = [...nextState.lines];
            let newCursorRow = nextState.cursorRow;
            let newCursorCol = nextState.cursorCol;
            const currentLine = (r) => newLines[r] ?? '';
            let payload = action.payload;
            if (options.singleLine) {
                payload = payload.replace(/[\r\n]/g, '');
            }
            if (options.inputFilter) {
                payload = options.inputFilter(payload);
            }
            if (payload.length === 0) {
                return state;
            }
            const str = stripUnsafeCharacters(payload.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
            const parts = str.split('\n');
            const lineContent = currentLine(newCursorRow);
            const before = cpSlice(lineContent, 0, newCursorCol);
            const after = cpSlice(lineContent, newCursorCol);
            if (parts.length > 1) {
                newLines[newCursorRow] = before + parts[0];
                const remainingParts = parts.slice(1);
                const lastPartOriginal = remainingParts.pop() ?? '';
                newLines.splice(newCursorRow + 1, 0, ...remainingParts);
                newLines.splice(newCursorRow + parts.length - 1, 0, lastPartOriginal + after);
                newCursorRow = newCursorRow + parts.length - 1;
                newCursorCol = cpLen(lastPartOriginal);
            }
            else {
                newLines[newCursorRow] = before + parts[0] + after;
                newCursorCol = cpLen(before) + cpLen(parts[0]);
            }
            return {
                ...nextState,
                lines: newLines,
                cursorRow: newCursorRow,
                cursorCol: newCursorCol,
                preferredCol: null,
            };
        }
        case 'backspace': {
            const nextState = pushUndoLocal(state);
            const newLines = [...nextState.lines];
            let newCursorRow = nextState.cursorRow;
            let newCursorCol = nextState.cursorCol;
            const currentLine = (r) => newLines[r] ?? '';
            if (newCursorCol === 0 && newCursorRow === 0)
                return state;
            if (newCursorCol > 0) {
                const lineContent = currentLine(newCursorRow);
                newLines[newCursorRow] =
                    cpSlice(lineContent, 0, newCursorCol - 1) +
                        cpSlice(lineContent, newCursorCol);
                newCursorCol--;
            }
            else if (newCursorRow > 0) {
                const prevLineContent = currentLine(newCursorRow - 1);
                const currentLineContentVal = currentLine(newCursorRow);
                const newCol = cpLen(prevLineContent);
                newLines[newCursorRow - 1] = prevLineContent + currentLineContentVal;
                newLines.splice(newCursorRow, 1);
                newCursorRow--;
                newCursorCol = newCol;
            }
            return {
                ...nextState,
                lines: newLines,
                cursorRow: newCursorRow,
                cursorCol: newCursorCol,
                preferredCol: null,
            };
        }
        case 'set_viewport': {
            const { width, height } = action.payload;
            if (width === state.viewportWidth && height === state.viewportHeight) {
                return state;
            }
            return {
                ...state,
                viewportWidth: width,
                viewportHeight: height,
            };
        }
        case 'move': {
            const { dir } = action.payload;
            const { cursorRow, cursorCol, lines, visualLayout, preferredCol } = state;
            // Visual movements
            if (dir === 'left' ||
                dir === 'right' ||
                dir === 'up' ||
                dir === 'down' ||
                dir === 'home' ||
                dir === 'end') {
                const visualCursor = calculateVisualCursorFromLayout(visualLayout, [
                    cursorRow,
                    cursorCol,
                ]);
                const { visualLines, visualToLogicalMap } = visualLayout;
                let newVisualRow = visualCursor[0];
                let newVisualCol = visualCursor[1];
                let newPreferredCol = preferredCol;
                const currentVisLineLen = cpLen(visualLines[newVisualRow] ?? '');
                switch (dir) {
                    case 'left':
                        newPreferredCol = null;
                        if (newVisualCol > 0) {
                            newVisualCol--;
                        }
                        else if (newVisualRow > 0) {
                            newVisualRow--;
                            newVisualCol = cpLen(visualLines[newVisualRow] ?? '');
                        }
                        break;
                    case 'right':
                        newPreferredCol = null;
                        if (newVisualCol < currentVisLineLen) {
                            newVisualCol++;
                        }
                        else if (newVisualRow < visualLines.length - 1) {
                            newVisualRow++;
                            newVisualCol = 0;
                        }
                        break;
                    case 'up':
                        if (newVisualRow > 0) {
                            if (newPreferredCol === null)
                                newPreferredCol = newVisualCol;
                            newVisualRow--;
                            newVisualCol = clamp(newPreferredCol, 0, cpLen(visualLines[newVisualRow] ?? ''));
                        }
                        break;
                    case 'down':
                        if (newVisualRow < visualLines.length - 1) {
                            if (newPreferredCol === null)
                                newPreferredCol = newVisualCol;
                            newVisualRow++;
                            newVisualCol = clamp(newPreferredCol, 0, cpLen(visualLines[newVisualRow] ?? ''));
                        }
                        break;
                    case 'home':
                        newPreferredCol = null;
                        newVisualCol = 0;
                        break;
                    case 'end':
                        newPreferredCol = null;
                        newVisualCol = currentVisLineLen;
                        break;
                    default: {
                        const exhaustiveCheck = dir;
                        debugLogger.error(`Unknown visual movement direction: ${exhaustiveCheck}`);
                        return state;
                    }
                }
                if (visualToLogicalMap[newVisualRow]) {
                    const [logRow, logicalStartCol] = visualToLogicalMap[newVisualRow];
                    const transformedToLogicalMap = visualLayout.transformedToLogicalMaps?.[logRow] ?? [];
                    let transformedStartCol = 0;
                    while (transformedStartCol < transformedToLogicalMap.length &&
                        transformedToLogicalMap[transformedStartCol] < logicalStartCol) {
                        transformedStartCol++;
                    }
                    const clampedTransformedCol = Math.min(transformedStartCol + newVisualCol, Math.max(0, transformedToLogicalMap.length - 1));
                    const newLogicalCol = transformedToLogicalMap[clampedTransformedCol] ??
                        cpLen(lines[logRow] ?? '');
                    return {
                        ...state,
                        cursorRow: logRow,
                        cursorCol: newLogicalCol,
                        preferredCol: newPreferredCol,
                    };
                }
                return state;
            }
            // Logical movements
            switch (dir) {
                case 'wordLeft': {
                    if (cursorCol === 0 && cursorRow === 0)
                        return state;
                    let newCursorRow = cursorRow;
                    let newCursorCol = cursorCol;
                    if (cursorCol === 0) {
                        newCursorRow--;
                        newCursorCol = cpLen(lines[newCursorRow] ?? '');
                    }
                    else {
                        const lineContent = lines[cursorRow];
                        newCursorCol = findPrevWordBoundary(lineContent, cursorCol);
                    }
                    return {
                        ...state,
                        cursorRow: newCursorRow,
                        cursorCol: newCursorCol,
                        preferredCol: null,
                    };
                }
                case 'wordRight': {
                    const lineContent = lines[cursorRow] ?? '';
                    if (cursorRow === lines.length - 1 &&
                        cursorCol === cpLen(lineContent)) {
                        return state;
                    }
                    let newCursorRow = cursorRow;
                    let newCursorCol = cursorCol;
                    const lineLen = cpLen(lineContent);
                    if (cursorCol >= lineLen) {
                        newCursorRow++;
                        newCursorCol = 0;
                    }
                    else {
                        newCursorCol = findNextWordBoundary(lineContent, cursorCol);
                    }
                    return {
                        ...state,
                        cursorRow: newCursorRow,
                        cursorCol: newCursorCol,
                        preferredCol: null,
                    };
                }
                default:
                    return state;
            }
        }
        case 'set_cursor': {
            return {
                ...state,
                ...action.payload,
            };
        }
        case 'delete': {
            const { cursorRow, cursorCol, lines } = state;
            const lineContent = currentLine(cursorRow);
            if (cursorCol < currentLineLen(cursorRow)) {
                const nextState = pushUndoLocal(state);
                const newLines = [...nextState.lines];
                newLines[cursorRow] =
                    cpSlice(lineContent, 0, cursorCol) +
                        cpSlice(lineContent, cursorCol + 1);
                return {
                    ...nextState,
                    lines: newLines,
                    preferredCol: null,
                };
            }
            else if (cursorRow < lines.length - 1) {
                const nextState = pushUndoLocal(state);
                const nextLineContent = currentLine(cursorRow + 1);
                const newLines = [...nextState.lines];
                newLines[cursorRow] = lineContent + nextLineContent;
                newLines.splice(cursorRow + 1, 1);
                return {
                    ...nextState,
                    lines: newLines,
                    preferredCol: null,
                };
            }
            return state;
        }
        case 'delete_word_left': {
            const { cursorRow, cursorCol } = state;
            if (cursorCol === 0 && cursorRow === 0)
                return state;
            const nextState = pushUndoLocal(state);
            const newLines = [...nextState.lines];
            let newCursorRow = cursorRow;
            let newCursorCol = cursorCol;
            if (newCursorCol > 0) {
                const lineContent = currentLine(newCursorRow);
                const prevWordStart = findPrevWordStartInLine(lineContent, newCursorCol);
                const start = prevWordStart === null ? 0 : prevWordStart;
                newLines[newCursorRow] =
                    cpSlice(lineContent, 0, start) + cpSlice(lineContent, newCursorCol);
                newCursorCol = start;
            }
            else {
                // Act as a backspace
                const prevLineContent = currentLine(cursorRow - 1);
                const currentLineContentVal = currentLine(cursorRow);
                const newCol = cpLen(prevLineContent);
                newLines[cursorRow - 1] = prevLineContent + currentLineContentVal;
                newLines.splice(cursorRow, 1);
                newCursorRow--;
                newCursorCol = newCol;
            }
            return {
                ...nextState,
                lines: newLines,
                cursorRow: newCursorRow,
                cursorCol: newCursorCol,
                preferredCol: null,
            };
        }
        case 'delete_word_right': {
            const { cursorRow, cursorCol, lines } = state;
            const lineContent = currentLine(cursorRow);
            const lineLen = cpLen(lineContent);
            if (cursorCol >= lineLen && cursorRow === lines.length - 1) {
                return state;
            }
            const nextState = pushUndoLocal(state);
            const newLines = [...nextState.lines];
            if (cursorCol >= lineLen) {
                // Act as a delete, joining with the next line
                const nextLineContent = currentLine(cursorRow + 1);
                newLines[cursorRow] = lineContent + nextLineContent;
                newLines.splice(cursorRow + 1, 1);
            }
            else {
                const nextWordStart = findNextWordStartInLine(lineContent, cursorCol);
                const end = nextWordStart === null ? lineLen : nextWordStart;
                newLines[cursorRow] =
                    cpSlice(lineContent, 0, cursorCol) + cpSlice(lineContent, end);
            }
            return {
                ...nextState,
                lines: newLines,
                preferredCol: null,
            };
        }
        case 'kill_line_right': {
            const { cursorRow, cursorCol, lines } = state;
            const lineContent = currentLine(cursorRow);
            if (cursorCol < currentLineLen(cursorRow)) {
                const nextState = pushUndoLocal(state);
                const newLines = [...nextState.lines];
                newLines[cursorRow] = cpSlice(lineContent, 0, cursorCol);
                return {
                    ...nextState,
                    lines: newLines,
                };
            }
            else if (cursorRow < lines.length - 1) {
                // Act as a delete
                const nextState = pushUndoLocal(state);
                const nextLineContent = currentLine(cursorRow + 1);
                const newLines = [...nextState.lines];
                newLines[cursorRow] = lineContent + nextLineContent;
                newLines.splice(cursorRow + 1, 1);
                return {
                    ...nextState,
                    lines: newLines,
                    preferredCol: null,
                };
            }
            return state;
        }
        case 'kill_line_left': {
            const { cursorRow, cursorCol } = state;
            if (cursorCol > 0) {
                const nextState = pushUndoLocal(state);
                const lineContent = currentLine(cursorRow);
                const newLines = [...nextState.lines];
                newLines[cursorRow] = cpSlice(lineContent, cursorCol);
                return {
                    ...nextState,
                    lines: newLines,
                    cursorCol: 0,
                    preferredCol: null,
                };
            }
            return state;
        }
        case 'undo': {
            const stateToRestore = state.undoStack[state.undoStack.length - 1];
            if (!stateToRestore)
                return state;
            const currentSnapshot = {
                lines: [...state.lines],
                cursorRow: state.cursorRow,
                cursorCol: state.cursorCol,
            };
            return {
                ...state,
                ...stateToRestore,
                undoStack: state.undoStack.slice(0, -1),
                redoStack: [...state.redoStack, currentSnapshot],
            };
        }
        case 'redo': {
            const stateToRestore = state.redoStack[state.redoStack.length - 1];
            if (!stateToRestore)
                return state;
            const currentSnapshot = {
                lines: [...state.lines],
                cursorRow: state.cursorRow,
                cursorCol: state.cursorCol,
            };
            return {
                ...state,
                ...stateToRestore,
                redoStack: state.redoStack.slice(0, -1),
                undoStack: [...state.undoStack, currentSnapshot],
            };
        }
        case 'replace_range': {
            const { startRow, startCol, endRow, endCol, text } = action.payload;
            const nextState = pushUndoLocal(state);
            return replaceRangeInternal(nextState, startRow, startCol, endRow, endCol, text);
        }
        case 'move_to_offset': {
            const { offset } = action.payload;
            const [newRow, newCol] = offsetToLogicalPos(state.lines.join('\n'), offset);
            return {
                ...state,
                cursorRow: newRow,
                cursorCol: newCol,
                preferredCol: null,
            };
        }
        case 'create_undo_snapshot': {
            return pushUndoLocal(state);
        }
        // Vim-specific operations
        case 'vim_delete_word_forward':
        case 'vim_delete_word_backward':
        case 'vim_delete_word_end':
        case 'vim_change_word_forward':
        case 'vim_change_word_backward':
        case 'vim_change_word_end':
        case 'vim_delete_line':
        case 'vim_change_line':
        case 'vim_delete_to_end_of_line':
        case 'vim_change_to_end_of_line':
        case 'vim_change_movement':
        case 'vim_move_left':
        case 'vim_move_right':
        case 'vim_move_up':
        case 'vim_move_down':
        case 'vim_move_word_forward':
        case 'vim_move_word_backward':
        case 'vim_move_word_end':
        case 'vim_delete_char':
        case 'vim_insert_at_cursor':
        case 'vim_append_at_cursor':
        case 'vim_open_line_below':
        case 'vim_open_line_above':
        case 'vim_append_at_line_end':
        case 'vim_insert_at_line_start':
        case 'vim_move_to_line_start':
        case 'vim_move_to_line_end':
        case 'vim_move_to_first_nonwhitespace':
        case 'vim_move_to_first_line':
        case 'vim_move_to_last_line':
        case 'vim_move_to_line':
        case 'vim_escape_insert_mode':
            return handleVimAction(state, action);
        default: {
            const exhaustiveCheck = action;
            debugLogger.error(`Unknown action encountered: ${exhaustiveCheck}`);
            return state;
        }
    }
}
export function textBufferReducer(state, action, options = {}) {
    const newState = textBufferReducerLogic(state, action, options);
    const newTransformedLines = newState.lines !== state.lines
        ? calculateTransformations(newState.lines)
        : state.transformationsByLine;
    const oldTransform = getTransformUnderCursor(state.cursorRow, state.cursorCol, state.transformationsByLine);
    const newTransform = getTransformUnderCursor(newState.cursorRow, newState.cursorCol, newTransformedLines);
    const oldInside = oldTransform !== null;
    const newInside = newTransform !== null;
    const movedBetweenTransforms = oldTransform !== newTransform &&
        (oldTransform !== null || newTransform !== null);
    if (newState.lines !== state.lines ||
        newState.viewportWidth !== state.viewportWidth ||
        oldInside !== newInside ||
        movedBetweenTransforms) {
        const shouldResetPreferred = oldInside !== newInside || movedBetweenTransforms;
        return {
            ...newState,
            preferredCol: shouldResetPreferred ? null : newState.preferredCol,
            visualLayout: calculateLayout(newState.lines, newState.viewportWidth, [
                newState.cursorRow,
                newState.cursorCol,
            ]),
            transformationsByLine: newTransformedLines,
        };
    }
    return newState;
}
// --- End of reducer logic ---
export function useTextBuffer({ initialText = '', initialCursorOffset = 0, viewport, stdin, setRawMode, onChange, isValidPath, shellModeActive = false, inputFilter, singleLine = false, getPreferredEditor, }) {
    const initialState = useMemo(() => {
        const lines = initialText.split('\n');
        const [initialCursorRow, initialCursorCol] = calculateInitialCursorPosition(lines.length === 0 ? [''] : lines, initialCursorOffset);
        const transformationsByLine = calculateTransformations(lines.length === 0 ? [''] : lines);
        const visualLayout = calculateLayout(lines.length === 0 ? [''] : lines, viewport.width, [initialCursorRow, initialCursorCol]);
        return {
            lines: lines.length === 0 ? [''] : lines,
            cursorRow: initialCursorRow,
            cursorCol: initialCursorCol,
            transformationsByLine,
            preferredCol: null,
            undoStack: [],
            redoStack: [],
            clipboard: null,
            selectionAnchor: null,
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
            visualLayout,
        };
    }, [initialText, initialCursorOffset, viewport.width, viewport.height]);
    const [state, dispatch] = useReducer((s, a) => textBufferReducer(s, a, { inputFilter, singleLine }), initialState);
    const { lines, cursorRow, cursorCol, preferredCol, selectionAnchor, visualLayout, transformationsByLine, } = state;
    const text = useMemo(() => lines.join('\n'), [lines]);
    const visualCursor = useMemo(() => calculateVisualCursorFromLayout(visualLayout, [cursorRow, cursorCol]), [visualLayout, cursorRow, cursorCol]);
    const { visualLines, visualToLogicalMap, transformedToLogicalMaps, visualToTransformedMap, } = visualLayout;
    const [visualScrollRow, setVisualScrollRow] = useState(0);
    useEffect(() => {
        if (onChange) {
            onChange(text);
        }
    }, [text, onChange]);
    useEffect(() => {
        dispatch({
            type: 'set_viewport',
            payload: { width: viewport.width, height: viewport.height },
        });
    }, [viewport.width, viewport.height]);
    // Update visual scroll (vertical)
    useEffect(() => {
        const { height } = viewport;
        const totalVisualLines = visualLines.length;
        const maxScrollStart = Math.max(0, totalVisualLines - height);
        let newVisualScrollRow = visualScrollRow;
        if (visualCursor[0] < visualScrollRow) {
            newVisualScrollRow = visualCursor[0];
        }
        else if (visualCursor[0] >= visualScrollRow + height) {
            newVisualScrollRow = visualCursor[0] - height + 1;
        }
        // When the number of visual lines shrinks (e.g., after widening the viewport),
        // ensure scroll never starts beyond the last valid start so we can render a full window.
        newVisualScrollRow = clamp(newVisualScrollRow, 0, maxScrollStart);
        if (newVisualScrollRow !== visualScrollRow) {
            setVisualScrollRow(newVisualScrollRow);
        }
    }, [visualCursor, visualScrollRow, viewport, visualLines.length]);
    const insert = useCallback((ch, { paste = false } = {}) => {
        if (!singleLine && /[\n\r]/.test(ch)) {
            dispatch({ type: 'insert', payload: ch });
            return;
        }
        const minLengthToInferAsDragDrop = 3;
        if (ch.length >= minLengthToInferAsDragDrop &&
            !shellModeActive &&
            paste) {
            let potentialPath = ch.trim();
            const quoteMatch = potentialPath.match(/^'(.*)'$/);
            if (quoteMatch) {
                potentialPath = quoteMatch[1];
            }
            potentialPath = potentialPath.trim();
            const processed = parsePastedPaths(potentialPath, isValidPath);
            if (processed) {
                ch = processed;
            }
        }
        let currentText = '';
        for (const char of toCodePoints(ch)) {
            if (char.codePointAt(0) === 127) {
                if (currentText.length > 0) {
                    dispatch({ type: 'insert', payload: currentText });
                    currentText = '';
                }
                dispatch({ type: 'backspace' });
            }
            else {
                currentText += char;
            }
        }
        if (currentText.length > 0) {
            dispatch({ type: 'insert', payload: currentText });
        }
    }, [isValidPath, shellModeActive, singleLine]);
    const newline = useCallback(() => {
        if (singleLine) {
            return;
        }
        dispatch({ type: 'insert', payload: '\n' });
    }, [singleLine]);
    const backspace = useCallback(() => {
        dispatch({ type: 'backspace' });
    }, []);
    const del = useCallback(() => {
        dispatch({ type: 'delete' });
    }, []);
    const move = useCallback((dir) => {
        dispatch({ type: 'move', payload: { dir } });
    }, [dispatch]);
    const undo = useCallback(() => {
        dispatch({ type: 'undo' });
    }, []);
    const redo = useCallback(() => {
        dispatch({ type: 'redo' });
    }, []);
    const setText = useCallback((newText) => {
        dispatch({ type: 'set_text', payload: newText });
    }, []);
    const deleteWordLeft = useCallback(() => {
        dispatch({ type: 'delete_word_left' });
    }, []);
    const deleteWordRight = useCallback(() => {
        dispatch({ type: 'delete_word_right' });
    }, []);
    const killLineRight = useCallback(() => {
        dispatch({ type: 'kill_line_right' });
    }, []);
    const killLineLeft = useCallback(() => {
        dispatch({ type: 'kill_line_left' });
    }, []);
    // Vim-specific operations
    const vimDeleteWordForward = useCallback((count) => {
        dispatch({ type: 'vim_delete_word_forward', payload: { count } });
    }, []);
    const vimDeleteWordBackward = useCallback((count) => {
        dispatch({ type: 'vim_delete_word_backward', payload: { count } });
    }, []);
    const vimDeleteWordEnd = useCallback((count) => {
        dispatch({ type: 'vim_delete_word_end', payload: { count } });
    }, []);
    const vimChangeWordForward = useCallback((count) => {
        dispatch({ type: 'vim_change_word_forward', payload: { count } });
    }, []);
    const vimChangeWordBackward = useCallback((count) => {
        dispatch({ type: 'vim_change_word_backward', payload: { count } });
    }, []);
    const vimChangeWordEnd = useCallback((count) => {
        dispatch({ type: 'vim_change_word_end', payload: { count } });
    }, []);
    const vimDeleteLine = useCallback((count) => {
        dispatch({ type: 'vim_delete_line', payload: { count } });
    }, []);
    const vimChangeLine = useCallback((count) => {
        dispatch({ type: 'vim_change_line', payload: { count } });
    }, []);
    const vimDeleteToEndOfLine = useCallback(() => {
        dispatch({ type: 'vim_delete_to_end_of_line' });
    }, []);
    const vimChangeToEndOfLine = useCallback(() => {
        dispatch({ type: 'vim_change_to_end_of_line' });
    }, []);
    const vimChangeMovement = useCallback((movement, count) => {
        dispatch({ type: 'vim_change_movement', payload: { movement, count } });
    }, []);
    // New vim navigation and operation methods
    const vimMoveLeft = useCallback((count) => {
        dispatch({ type: 'vim_move_left', payload: { count } });
    }, []);
    const vimMoveRight = useCallback((count) => {
        dispatch({ type: 'vim_move_right', payload: { count } });
    }, []);
    const vimMoveUp = useCallback((count) => {
        dispatch({ type: 'vim_move_up', payload: { count } });
    }, []);
    const vimMoveDown = useCallback((count) => {
        dispatch({ type: 'vim_move_down', payload: { count } });
    }, []);
    const vimMoveWordForward = useCallback((count) => {
        dispatch({ type: 'vim_move_word_forward', payload: { count } });
    }, []);
    const vimMoveWordBackward = useCallback((count) => {
        dispatch({ type: 'vim_move_word_backward', payload: { count } });
    }, []);
    const vimMoveWordEnd = useCallback((count) => {
        dispatch({ type: 'vim_move_word_end', payload: { count } });
    }, []);
    const vimDeleteChar = useCallback((count) => {
        dispatch({ type: 'vim_delete_char', payload: { count } });
    }, []);
    const vimInsertAtCursor = useCallback(() => {
        dispatch({ type: 'vim_insert_at_cursor' });
    }, []);
    const vimAppendAtCursor = useCallback(() => {
        dispatch({ type: 'vim_append_at_cursor' });
    }, []);
    const vimOpenLineBelow = useCallback(() => {
        dispatch({ type: 'vim_open_line_below' });
    }, []);
    const vimOpenLineAbove = useCallback(() => {
        dispatch({ type: 'vim_open_line_above' });
    }, []);
    const vimAppendAtLineEnd = useCallback(() => {
        dispatch({ type: 'vim_append_at_line_end' });
    }, []);
    const vimInsertAtLineStart = useCallback(() => {
        dispatch({ type: 'vim_insert_at_line_start' });
    }, []);
    const vimMoveToLineStart = useCallback(() => {
        dispatch({ type: 'vim_move_to_line_start' });
    }, []);
    const vimMoveToLineEnd = useCallback(() => {
        dispatch({ type: 'vim_move_to_line_end' });
    }, []);
    const vimMoveToFirstNonWhitespace = useCallback(() => {
        dispatch({ type: 'vim_move_to_first_nonwhitespace' });
    }, []);
    const vimMoveToFirstLine = useCallback(() => {
        dispatch({ type: 'vim_move_to_first_line' });
    }, []);
    const vimMoveToLastLine = useCallback(() => {
        dispatch({ type: 'vim_move_to_last_line' });
    }, []);
    const vimMoveToLine = useCallback((lineNumber) => {
        dispatch({ type: 'vim_move_to_line', payload: { lineNumber } });
    }, []);
    const vimEscapeInsertMode = useCallback(() => {
        dispatch({ type: 'vim_escape_insert_mode' });
    }, []);
    const openInExternalEditor = useCallback(async () => {
        const tmpDir = fs.mkdtempSync(pathMod.join(os.tmpdir(), 'gemini-edit-'));
        const filePath = pathMod.join(tmpDir, 'buffer.txt');
        fs.writeFileSync(filePath, text, 'utf8');
        let command = undefined;
        const args = [filePath];
        const preferredEditorType = getPreferredEditor?.();
        if (!command && preferredEditorType) {
            command = getEditorCommand(preferredEditorType);
            if (isGuiEditor(preferredEditorType)) {
                args.unshift('--wait');
            }
        }
        if (!command) {
            command =
                (process.env['VISUAL'] ??
                    process.env['EDITOR'] ??
                    process.platform === 'win32')
                    ? 'notepad'
                    : 'vi';
        }
        dispatch({ type: 'create_undo_snapshot' });
        const wasRaw = stdin?.isRaw ?? false;
        try {
            setRawMode?.(false);
            const { status, error } = spawnSync(command, args, {
                stdio: 'inherit',
            });
            if (error)
                throw error;
            if (typeof status === 'number' && status !== 0)
                throw new Error(`External editor exited with status ${status}`);
            let newText = fs.readFileSync(filePath, 'utf8');
            newText = newText.replace(/\r\n?/g, '\n');
            dispatch({ type: 'set_text', payload: newText, pushToUndo: false });
        }
        catch (err) {
            coreEvents.emitFeedback('error', '[useTextBuffer] external editor error', err);
        }
        finally {
            coreEvents.emit(CoreEvent.ExternalEditorClosed);
            if (wasRaw)
                setRawMode?.(true);
            try {
                fs.unlinkSync(filePath);
            }
            catch {
                /* ignore */
            }
            try {
                fs.rmdirSync(tmpDir);
            }
            catch {
                /* ignore */
            }
        }
    }, [text, stdin, setRawMode, getPreferredEditor]);
    const handleInput = useCallback((key) => {
        const { sequence: input } = key;
        if (key.name === 'paste')
            insert(input, { paste: true });
        else if (keyMatchers[Command.RETURN](key))
            newline();
        else if (keyMatchers[Command.MOVE_LEFT](key))
            move('left');
        else if (keyMatchers[Command.MOVE_RIGHT](key))
            move('right');
        else if (keyMatchers[Command.MOVE_UP](key))
            move('up');
        else if (keyMatchers[Command.MOVE_DOWN](key))
            move('down');
        else if (keyMatchers[Command.MOVE_WORD_LEFT](key))
            move('wordLeft');
        else if (keyMatchers[Command.MOVE_WORD_RIGHT](key))
            move('wordRight');
        else if (keyMatchers[Command.HOME](key))
            move('home');
        else if (keyMatchers[Command.END](key))
            move('end');
        else if (keyMatchers[Command.DELETE_WORD_BACKWARD](key))
            deleteWordLeft();
        else if (keyMatchers[Command.DELETE_WORD_FORWARD](key))
            deleteWordRight();
        else if (keyMatchers[Command.DELETE_CHAR_LEFT](key))
            backspace();
        else if (keyMatchers[Command.DELETE_CHAR_RIGHT](key))
            del();
        else if (keyMatchers[Command.UNDO](key))
            undo();
        else if (keyMatchers[Command.REDO](key))
            redo();
        else if (key.insertable)
            insert(input, { paste: false });
    }, [
        newline,
        move,
        deleteWordLeft,
        deleteWordRight,
        backspace,
        del,
        insert,
        undo,
        redo,
    ]);
    const renderedVisualLines = useMemo(() => visualLines.slice(visualScrollRow, visualScrollRow + viewport.height), [visualLines, visualScrollRow, viewport.height]);
    const replaceRange = useCallback((startRow, startCol, endRow, endCol, text) => {
        dispatch({
            type: 'replace_range',
            payload: { startRow, startCol, endRow, endCol, text },
        });
    }, []);
    const replaceRangeByOffset = useCallback((startOffset, endOffset, replacementText) => {
        const [startRow, startCol] = offsetToLogicalPos(text, startOffset);
        const [endRow, endCol] = offsetToLogicalPos(text, endOffset);
        replaceRange(startRow, startCol, endRow, endCol, replacementText);
    }, [text, replaceRange]);
    const moveToOffset = useCallback((offset) => {
        dispatch({ type: 'move_to_offset', payload: { offset } });
    }, []);
    const moveToVisualPosition = useCallback((visRow, visCol) => {
        const { visualLines, visualToLogicalMap, transformedToLogicalMaps, visualToTransformedMap, } = visualLayout;
        // Clamp visRow to valid range
        const clampedVisRow = Math.max(0, Math.min(visRow, visualLines.length - 1));
        const visualLine = visualLines[clampedVisRow] || '';
        if (visualToLogicalMap[clampedVisRow]) {
            const [logRow] = visualToLogicalMap[clampedVisRow];
            const transformedToLogicalMap = transformedToLogicalMaps?.[logRow] ?? [];
            // Where does this visual line begin within the transformed line?
            const startColInTransformed = visualToTransformedMap?.[clampedVisRow] ?? 0;
            // Handle wide characters: convert visual X position to character offset
            const codePoints = toCodePoints(visualLine);
            let currentVisX = 0;
            let charOffset = 0;
            for (const char of codePoints) {
                const charWidth = getCachedStringWidth(char);
                // If the click is within this character
                if (visCol < currentVisX + charWidth) {
                    // Check if we clicked the second half of a wide character
                    if (charWidth > 1 && visCol >= currentVisX + charWidth / 2) {
                        charOffset++;
                    }
                    break;
                }
                currentVisX += charWidth;
                charOffset++;
            }
            // Clamp charOffset to length
            charOffset = Math.min(charOffset, codePoints.length);
            // Map character offset through transformations to get logical position
            const transformedCol = Math.min(startColInTransformed + charOffset, Math.max(0, transformedToLogicalMap.length - 1));
            const newCursorRow = logRow;
            const newCursorCol = transformedToLogicalMap[transformedCol] ?? cpLen(lines[logRow] ?? '');
            dispatch({
                type: 'set_cursor',
                payload: {
                    cursorRow: newCursorRow,
                    cursorCol: newCursorCol,
                    preferredCol: charOffset,
                },
            });
        }
    }, [visualLayout, lines]);
    const getOffset = useCallback(() => logicalPosToOffset(lines, cursorRow, cursorCol), [lines, cursorRow, cursorCol]);
    const returnValue = useMemo(() => ({
        lines,
        text,
        cursor: [cursorRow, cursorCol],
        preferredCol,
        selectionAnchor,
        allVisualLines: visualLines,
        viewportVisualLines: renderedVisualLines,
        visualCursor,
        visualScrollRow,
        visualToLogicalMap,
        transformedToLogicalMaps,
        visualToTransformedMap,
        transformationsByLine,
        visualLayout,
        setText,
        insert,
        newline,
        backspace,
        del,
        move,
        undo,
        redo,
        replaceRange,
        replaceRangeByOffset,
        moveToOffset,
        getOffset,
        moveToVisualPosition,
        deleteWordLeft,
        deleteWordRight,
        killLineRight,
        killLineLeft,
        handleInput,
        openInExternalEditor,
        // Vim-specific operations
        vimDeleteWordForward,
        vimDeleteWordBackward,
        vimDeleteWordEnd,
        vimChangeWordForward,
        vimChangeWordBackward,
        vimChangeWordEnd,
        vimDeleteLine,
        vimChangeLine,
        vimDeleteToEndOfLine,
        vimChangeToEndOfLine,
        vimChangeMovement,
        vimMoveLeft,
        vimMoveRight,
        vimMoveUp,
        vimMoveDown,
        vimMoveWordForward,
        vimMoveWordBackward,
        vimMoveWordEnd,
        vimDeleteChar,
        vimInsertAtCursor,
        vimAppendAtCursor,
        vimOpenLineBelow,
        vimOpenLineAbove,
        vimAppendAtLineEnd,
        vimInsertAtLineStart,
        vimMoveToLineStart,
        vimMoveToLineEnd,
        vimMoveToFirstNonWhitespace,
        vimMoveToFirstLine,
        vimMoveToLastLine,
        vimMoveToLine,
        vimEscapeInsertMode,
    }), [
        lines,
        text,
        cursorRow,
        cursorCol,
        preferredCol,
        selectionAnchor,
        visualLines,
        renderedVisualLines,
        visualCursor,
        visualScrollRow,
        visualToLogicalMap,
        transformedToLogicalMaps,
        visualToTransformedMap,
        transformationsByLine,
        visualLayout,
        setText,
        insert,
        newline,
        backspace,
        del,
        move,
        undo,
        redo,
        replaceRange,
        replaceRangeByOffset,
        moveToOffset,
        getOffset,
        moveToVisualPosition,
        deleteWordLeft,
        deleteWordRight,
        killLineRight,
        killLineLeft,
        handleInput,
        openInExternalEditor,
        vimDeleteWordForward,
        vimDeleteWordBackward,
        vimDeleteWordEnd,
        vimChangeWordForward,
        vimChangeWordBackward,
        vimChangeWordEnd,
        vimDeleteLine,
        vimChangeLine,
        vimDeleteToEndOfLine,
        vimChangeToEndOfLine,
        vimChangeMovement,
        vimMoveLeft,
        vimMoveRight,
        vimMoveUp,
        vimMoveDown,
        vimMoveWordForward,
        vimMoveWordBackward,
        vimMoveWordEnd,
        vimDeleteChar,
        vimInsertAtCursor,
        vimAppendAtCursor,
        vimOpenLineBelow,
        vimOpenLineAbove,
        vimAppendAtLineEnd,
        vimInsertAtLineStart,
        vimMoveToLineStart,
        vimMoveToLineEnd,
        vimMoveToFirstNonWhitespace,
        vimMoveToFirstLine,
        vimMoveToLastLine,
        vimMoveToLine,
        vimEscapeInsertMode,
    ]);
    return returnValue;
}
//# sourceMappingURL=text-buffer.js.map