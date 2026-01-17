/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config } from '@google/gemini-cli-core';
export declare function listSessions(config: Config): Promise<void>;
export declare function deleteSession(config: Config, sessionIndex: string): Promise<void>;
