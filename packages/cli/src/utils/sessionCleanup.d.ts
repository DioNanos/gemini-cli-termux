/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config } from '@google/gemini-cli-core';
import type { Settings } from '../config/settings.js';
export declare const DEFAULT_MIN_RETENTION: string;
/**
 * Result of session cleanup operation
 */
export interface CleanupResult {
    disabled: boolean;
    scanned: number;
    deleted: number;
    skipped: number;
    failed: number;
}
/**
 * Main entry point for session cleanup during CLI startup
 */
export declare function cleanupExpiredSessions(config: Config, settings: Settings): Promise<CleanupResult>;
