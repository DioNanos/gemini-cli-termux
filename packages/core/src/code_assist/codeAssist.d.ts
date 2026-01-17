/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ContentGenerator } from '../core/contentGenerator.js';
import { AuthType } from '../core/contentGenerator.js';
import type { HttpOptions } from './server.js';
import { CodeAssistServer } from './server.js';
import type { Config } from '../config/config.js';
export declare function createCodeAssistContentGenerator(httpOptions: HttpOptions, authType: AuthType, config: Config, sessionId?: string): Promise<ContentGenerator>;
export declare function getCodeAssistServer(config: Config): CodeAssistServer | undefined;
