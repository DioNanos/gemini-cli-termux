/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config, ResumedSessionData } from '@google/gemini-cli-core';
import type { LoadedSettings } from './config/settings.js';
interface RunNonInteractiveParams {
    config: Config;
    settings: LoadedSettings;
    input: string;
    prompt_id: string;
    resumedSessionData?: ResumedSessionData;
}
export declare function runNonInteractive({ config, settings, input, prompt_id, resumedSessionData, }: RunNonInteractiveParams): Promise<void>;
export {};
