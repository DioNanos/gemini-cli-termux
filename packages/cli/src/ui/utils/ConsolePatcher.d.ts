/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ConsoleMessageItem } from '../types.js';
interface ConsolePatcherParams {
    onNewMessage?: (message: Omit<ConsoleMessageItem, 'id'>) => void;
    debugMode: boolean;
    stderr?: boolean;
}
export declare class ConsolePatcher {
    private originalConsoleLog;
    private originalConsoleWarn;
    private originalConsoleError;
    private originalConsoleDebug;
    private originalConsoleInfo;
    private params;
    constructor(params: ConsolePatcherParams);
    patch(): void;
    cleanup: () => void;
    private formatArgs;
    private patchConsoleMethod;
}
export {};
