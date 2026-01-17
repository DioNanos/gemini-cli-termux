/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
export declare function useIncludeDirsTrust(config: Config, isTrustedFolder: boolean | undefined, historyManager: UseHistoryManagerReturn, setCustomDialog: (dialog: React.ReactNode | null) => void): void;
