/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { IndividualToolCallDisplay } from '../../types.js';
import { type TextEmphasis } from './ToolShared.js';
import type { Config } from '@google/gemini-cli-core';
export type { TextEmphasis };
export interface ToolMessageProps extends IndividualToolCallDisplay {
    availableTerminalHeight?: number;
    terminalWidth: number;
    emphasis?: TextEmphasis;
    renderOutputAsMarkdown?: boolean;
    isFirst: boolean;
    borderColor: string;
    borderDimColor: boolean;
    activeShellPtyId?: number | null;
    embeddedShellFocused?: boolean;
    ptyId?: number;
    config?: Config;
}
export declare const ToolMessage: React.FC<ToolMessageProps>;
