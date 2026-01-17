/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
/**
 * Finds the most recently created session that needs a summary.
 * Returns the path if it needs a summary, null otherwise.
 */
export declare function getPreviousSession(config: Config): Promise<string | null>;
/**
 * Generates summary for the previous session if it lacks one.
 * This is designed to be called fire-and-forget on startup.
 */
export declare function generateSummary(config: Config): Promise<void>;
