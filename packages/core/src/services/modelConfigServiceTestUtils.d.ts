/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ResolvedModelConfig } from '../services/modelConfigService.js';
/**
 * Creates a ResolvedModelConfig with sensible defaults, allowing overrides.
 */
export declare const makeResolvedModelConfig: (model: string, overrides?: Partial<ResolvedModelConfig["generateContentConfig"]>) => ResolvedModelConfig;
