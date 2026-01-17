/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type TerminalBackgroundColor } from '../ui/utils/terminalCapabilityManager.js';
import type { LoadedSettings } from '../config/settings.js';
import { type Config } from '@google/gemini-cli-core';
/**
 * Detects terminal capabilities, loads themes, and sets the active theme.
 * @param config The application config.
 * @param settings The loaded settings.
 * @returns The detected terminal background color.
 */
export declare function setupTerminalAndTheme(config: Config, settings: LoadedSettings): Promise<TerminalBackgroundColor>;
