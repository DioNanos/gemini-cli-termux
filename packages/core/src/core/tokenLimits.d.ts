/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
type Model = string;
type TokenCount = number;
export declare const DEFAULT_TOKEN_LIMIT = 1048576;
export declare function tokenLimit(model: Model): TokenCount;
export {};
