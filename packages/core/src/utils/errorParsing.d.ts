/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { UserTierId } from '../code_assist/types.js';
import { AuthType } from '../core/contentGenerator.js';
export declare function parseAndFormatApiError(error: unknown, authType?: AuthType, userTier?: UserTierId, currentModel?: string, fallbackModel?: string): string;
