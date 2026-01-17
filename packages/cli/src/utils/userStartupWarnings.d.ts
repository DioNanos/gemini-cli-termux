/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */
import type { Settings } from '../config/settingsSchema.js';
export declare function getUserStartupWarnings(settings: Settings, workspaceRoot?: string): Promise<string[]>;
