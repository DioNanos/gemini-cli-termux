/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SessionMetrics, ComputedSessionStats, ModelMetrics } from '../contexts/SessionContext.js';
export declare function calculateErrorRate(metrics: ModelMetrics): number;
export declare function calculateAverageLatency(metrics: ModelMetrics): number;
export declare function calculateCacheHitRate(metrics: ModelMetrics): number;
export declare const computeSessionStats: (metrics: SessionMetrics) => ComputedSessionStats;
