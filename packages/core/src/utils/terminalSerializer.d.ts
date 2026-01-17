/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Terminal } from '@xterm/headless';
export interface AnsiToken {
    text: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    dim: boolean;
    inverse: boolean;
    fg: string;
    bg: string;
}
export type AnsiLine = AnsiToken[];
export type AnsiOutput = AnsiLine[];
export declare const enum ColorMode {
    DEFAULT = 0,
    PALETTE = 1,
    RGB = 2
}
export declare function serializeTerminalToObject(terminal: Terminal): AnsiOutput;
export declare function convertColorToHex(color: number, colorMode: ColorMode, defaultColor: string): string;
