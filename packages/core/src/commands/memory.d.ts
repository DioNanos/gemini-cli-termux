/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { MessageActionReturn, ToolActionReturn } from './types.js';
export declare function showMemory(config: Config): MessageActionReturn;
export declare function addMemory(args?: string): MessageActionReturn | ToolActionReturn;
export declare function refreshMemory(config: Config): Promise<MessageActionReturn>;
export declare function listMemoryFiles(config: Config): MessageActionReturn;
