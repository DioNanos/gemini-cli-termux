/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PartListUnion, Part } from '@google/genai';
import type { ContentGenerator } from '../core/contentGenerator.js';
/**
 * Estimates token count for parts synchronously using a heuristic.
 * - Text: character-based heuristic (ASCII vs CJK) for small strings, length/4 for massive ones.
 * - Non-text (Tools, etc): JSON string length / 4.
 */
export declare function estimateTokenCountSync(parts: Part[]): number;
/**
 * Calculates the token count of the request.
 * If the request contains only text or tools, it estimates the token count locally.
 * If the request contains media (images, files), it uses the countTokens API.
 */
export declare function calculateRequestTokenCount(request: PartListUnion, contentGenerator: ContentGenerator, model: string): Promise<number>;
