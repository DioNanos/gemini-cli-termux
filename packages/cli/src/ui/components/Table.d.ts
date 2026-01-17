/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
export interface Column<T> {
    key: string;
    header: React.ReactNode;
    width?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    renderCell?: (item: T) => React.ReactNode;
}
interface TableProps<T> {
    data: T[];
    columns: Array<Column<T>>;
}
export declare function Table<T>({ data, columns }: TableProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
