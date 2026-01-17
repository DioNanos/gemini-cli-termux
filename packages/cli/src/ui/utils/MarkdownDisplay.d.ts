/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
interface MarkdownDisplayProps {
    text: string;
    isPending: boolean;
    availableTerminalHeight?: number;
    terminalWidth: number;
    renderMarkdown?: boolean;
}
export declare const MarkdownDisplay: React.NamedExoticComponent<MarkdownDisplayProps>;
export {};
