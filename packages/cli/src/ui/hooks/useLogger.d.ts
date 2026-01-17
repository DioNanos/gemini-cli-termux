/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Storage } from '@google/gemini-cli-core';
import { Logger } from '@google/gemini-cli-core';
/**
 * Hook to manage the logger instance.
 */
export declare const useLogger: (storage: Storage) => Logger | null;
