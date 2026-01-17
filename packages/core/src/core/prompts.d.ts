/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
export declare function resolvePathFromEnv(envVar?: string): {
    isSwitch: boolean;
    value: string | null;
    isDisabled: boolean;
};
export declare function getCoreSystemPrompt(config: Config, userMemory?: string, interactiveOverride?: boolean): string;
/**
 * Provides the system prompt for the history compression process.
 * This prompt instructs the model to act as a specialized state manager,
 * think in a scratchpad, and produce a structured XML summary.
 */
export declare function getCompressionPrompt(): string;
