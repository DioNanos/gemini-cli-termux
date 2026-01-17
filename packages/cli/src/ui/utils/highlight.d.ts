/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Transformation } from '../components/shared/text-buffer.js';
export type HighlightToken = {
    text: string;
    type: 'default' | 'command' | 'file';
};
export declare function parseInputForHighlighting(text: string, index: number, transformations?: Transformation[], cursorCol?: number): readonly HighlightToken[];
export declare function parseSegmentsFromTokens(tokens: readonly HighlightToken[], sliceStart: number, sliceEnd: number): readonly HighlightToken[];
