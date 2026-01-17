/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ConsoleMessageItem } from '../types.js';
export interface UseConsoleMessagesReturn {
    consoleMessages: ConsoleMessageItem[];
    clearConsoleMessages: () => void;
}
export declare function useConsoleMessages(): UseConsoleMessagesReturn;
