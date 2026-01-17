/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type FetchAdminControlsResponse } from '@google/gemini-cli-core';
export declare function relaunchOnExitCode(runner: () => Promise<number>): Promise<void>;
export declare function relaunchAppInChildProcess(additionalNodeArgs: string[], additionalScriptArgs: string[], remoteAdminSettings?: FetchAdminControlsResponse): Promise<void>;
