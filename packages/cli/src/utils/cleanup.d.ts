/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
export declare function registerCleanup(fn: (() => void) | (() => Promise<void>)): void;
export declare function registerSyncCleanup(fn: () => void): void;
/**
 * Resets the internal cleanup state for testing purposes.
 * This allows tests to run in isolation without vi.resetModules().
 */
export declare function resetCleanupForTesting(): void;
export declare function runSyncCleanup(): void;
/**
 * Register the config instance for telemetry shutdown.
 * This must be called early in the application lifecycle.
 */
export declare function registerTelemetryConfig(config: Config): void;
export declare function runExitCleanup(): Promise<void>;
export declare function cleanupCheckpoints(): Promise<void>;
