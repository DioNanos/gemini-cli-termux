/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type DOMElement } from 'ink';
export interface StickyHeaderProps {
    children: React.ReactNode;
    width: number;
    isFirst: boolean;
    borderColor: string;
    borderDimColor: boolean;
    containerRef?: React.RefObject<DOMElement | null>;
}
export declare const StickyHeader: React.FC<StickyHeaderProps>;
