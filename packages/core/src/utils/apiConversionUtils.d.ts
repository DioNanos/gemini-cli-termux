/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentParameters } from '@google/genai';
/**
 * Transforms a standard SDK GenerateContentParameters object into the
 * equivalent REST API payload format. This is primarily used for debugging
 * and exporting requests.
 */
export declare function convertToRestPayload(req: GenerateContentParameters): Record<string, unknown>;
