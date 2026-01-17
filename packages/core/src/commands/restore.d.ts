/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GitService } from '../services/gitService.js';
import type { CommandActionReturn } from './types.js';
import { type ToolCallData } from '../utils/checkpointUtils.js';
export declare function performRestore<HistoryType = unknown, ArgsType = unknown>(toolCallData: ToolCallData<HistoryType, ArgsType>, gitService: GitService | undefined): AsyncGenerator<CommandActionReturn<HistoryType>>;
