/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { Theme } from '../themes/theme.js';
import type { LoadedSettings } from '../../config/settings.js';
export declare function colorizeLine(line: string, language: string | null, theme?: Theme): React.ReactNode;
export interface ColorizeCodeOptions {
    code: string;
    language?: string | null;
    availableHeight?: number;
    maxWidth: number;
    theme?: Theme | null;
    settings: LoadedSettings;
    hideLineNumbers?: boolean;
}
/**
 * Renders syntax-highlighted code for Ink applications using a selected theme.
 *
 * @param options The options for colorizing the code.
 * @returns A React.ReactNode containing Ink <Text> elements for the highlighted code.
 */
export declare function colorizeCode({ code, language, availableHeight, maxWidth, theme, settings, hideLineNumbers, }: ColorizeCodeOptions): React.ReactNode;
