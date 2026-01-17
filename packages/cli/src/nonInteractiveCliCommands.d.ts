/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PartListUnion } from '@google/genai';
import { type Config } from '@google/gemini-cli-core';
import type { LoadedSettings } from './config/settings.js';
/**
 * Processes a slash command in a non-interactive environment.
 *
 * @returns A Promise that resolves to `PartListUnion` if a valid command is
 *   found and results in a prompt, or `undefined` otherwise.
 * @throws {FatalInputError} if the command result is not supported in
 *   non-interactive mode.
 */
export declare const handleSlashCommand: (rawQuery: string, abortController: AbortController, config: Config, settings: LoadedSettings) => Promise<PartListUnion | undefined>;
