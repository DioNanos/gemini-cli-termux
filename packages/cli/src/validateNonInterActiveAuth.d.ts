/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
import { AuthType } from '@google/gemini-cli-core';
import { type LoadedSettings } from './config/settings.js';
export declare function validateNonInteractiveAuth(configuredAuthType: AuthType | undefined, useExternalAuth: boolean | undefined, nonInteractiveConfig: Config, settings: LoadedSettings): Promise<AuthType>;
