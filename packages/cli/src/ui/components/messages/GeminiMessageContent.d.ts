/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface GeminiMessageContentProps {
    text: string;
    isPending: boolean;
    availableTerminalHeight?: number;
    terminalWidth: number;
}
export declare const GeminiMessageContent: React.FC<GeminiMessageContentProps>;
export {};
