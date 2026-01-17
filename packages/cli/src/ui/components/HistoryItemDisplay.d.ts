/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { HistoryItem } from '../types.js';
import type { SlashCommand } from '../commands/types.js';
interface HistoryItemDisplayProps {
    item: HistoryItem;
    availableTerminalHeight?: number;
    terminalWidth: number;
    isPending: boolean;
    isFocused?: boolean;
    commands?: readonly SlashCommand[];
    activeShellPtyId?: number | null;
    embeddedShellFocused?: boolean;
    availableTerminalHeightGemini?: number;
}
export declare const HistoryItemDisplay: React.FC<HistoryItemDisplayProps>;
export {};
