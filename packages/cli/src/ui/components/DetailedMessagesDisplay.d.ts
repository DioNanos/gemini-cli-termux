/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { ConsoleMessageItem } from '../types.js';
interface DetailedMessagesDisplayProps {
    messages: ConsoleMessageItem[];
    maxHeight: number | undefined;
    width: number;
    hasFocus: boolean;
}
export declare const DetailedMessagesDisplay: React.FC<DetailedMessagesDisplayProps>;
export {};
