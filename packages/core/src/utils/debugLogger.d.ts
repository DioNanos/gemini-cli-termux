/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A simple, centralized logger for developer-facing debug messages.
 *
 * WHY USE THIS?
 * - It makes the INTENT of the log clear (it's for developers, not users).
 * - It provides a single point of control for debug logging behavior.
 * - We can lint against direct `console.*` usage to enforce this pattern.
 *
 * HOW IT WORKS:
 * This is a thin wrapper around the native `console` object. The `ConsolePatcher`
 * will intercept these calls and route them to the debug drawer UI.
 */
declare class DebugLogger {
    private logStream;
    constructor();
    private writeToFile;
    log(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    debug(...args: unknown[]): void;
}
export declare const debugLogger: DebugLogger;
export {};
