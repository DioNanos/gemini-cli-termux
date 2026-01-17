/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
interface TableRendererProps {
    headers: string[];
    rows: string[][];
    terminalWidth: number;
}
/**
 * Custom table renderer for markdown tables
 * We implement our own instead of using ink-table due to module compatibility issues
 */
export declare const TableRenderer: React.FC<TableRendererProps>;
export {};
