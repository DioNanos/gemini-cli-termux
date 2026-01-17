/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { IndividualToolCallDisplay } from '../../types.js';
interface ToolGroupMessageProps {
    groupId: number;
    toolCalls: IndividualToolCallDisplay[];
    availableTerminalHeight?: number;
    terminalWidth: number;
    isFocused?: boolean;
    activeShellPtyId?: number | null;
    embeddedShellFocused?: boolean;
    onShellInputSubmit?: (input: string) => void;
}
export declare const ToolGroupMessage: React.FC<ToolGroupMessageProps>;
export {};
