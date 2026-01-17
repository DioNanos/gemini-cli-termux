/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type SandboxConfig } from '@google/gemini-cli-core';
import type { Settings } from './settings.js';
interface SandboxCliArgs {
    sandbox?: boolean | string | null;
}
export declare function loadSandboxConfig(settings: Settings, argv: SandboxCliArgs): Promise<SandboxConfig | undefined>;
export {};
