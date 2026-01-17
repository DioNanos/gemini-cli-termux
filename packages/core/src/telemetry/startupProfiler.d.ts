/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
/**
 * Handle returned by start() that allows ending the phase without repeating the phase name.
 */
export interface StartupPhaseHandle {
    end(details?: Record<string, string | number | boolean>): void;
}
/**
 * Buffers startup performance metrics until the telemetry system is fully initialized.
 */
export declare class StartupProfiler {
    private phases;
    private static instance;
    private constructor();
    static getInstance(): StartupProfiler;
    /**
     * Returns the mark name for the start of a phase.
     */
    private getStartMarkName;
    /**
     * Returns the mark name for the end of a phase.
     */
    private getEndMarkName;
    /**
     * Marks the start of a phase and returns a handle to end it.
     *
     * If a phase with the same name is already active (started but not ended),
     * this method will log a warning and return `undefined`. This allows for
     * idempotent calls in environments where initialization might happen multiple
     * times.
     *
     * Callers should handle the potential `undefined` return value, typically
     * by using optional chaining: `handle?.end()`.
     */
    start(phaseName: string, details?: Record<string, string | number | boolean>): StartupPhaseHandle | undefined;
    /**
     * Marks the end of a phase and calculates duration.
     * This is now a private method; callers should use the handle returned by start().
     */
    private _end;
    /**
     * Flushes buffered metrics to the telemetry system.
     */
    flush(config: Config): void;
}
export declare const startupProfiler: StartupProfiler;
