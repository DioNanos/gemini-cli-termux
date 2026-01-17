/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { AnsiOutput } from '@google/gemini-cli-core';
interface AnsiOutputProps {
    data: AnsiOutput;
    availableTerminalHeight?: number;
    width: number;
}
export declare const AnsiOutputText: React.FC<AnsiOutputProps>;
export {};
