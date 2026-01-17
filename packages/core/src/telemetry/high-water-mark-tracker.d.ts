/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * High-water mark tracker for memory metrics
 * Only triggers when memory usage increases by a significant threshold
 */
export declare class HighWaterMarkTracker {
    private waterMarks;
    private lastUpdateTimes;
    private readonly growthThresholdPercent;
    constructor(growthThresholdPercent?: number);
    /**
     * Check if current value represents a new high-water mark that should trigger recording
     * @param metricType - Type of metric (e.g., 'heap_used', 'rss')
     * @param currentValue - Current memory value in bytes
     * @returns true if this value should trigger a recording
     */
    shouldRecordMetric(metricType: string, currentValue: number): boolean;
    /**
     * Get current high-water mark for a metric type
     */
    getHighWaterMark(metricType: string): number;
    /**
     * Get all high-water marks
     */
    getAllHighWaterMarks(): Record<string, number>;
    /**
     * Reset high-water mark for a specific metric type
     */
    resetHighWaterMark(metricType: string): void;
    /**
     * Reset all high-water marks
     */
    resetAllHighWaterMarks(): void;
    /**
     * Remove stale entries to avoid unbounded growth if metric types are variable.
     * Entries not updated within maxAgeMs will be removed.
     */
    cleanup(maxAgeMs?: number): void;
}
