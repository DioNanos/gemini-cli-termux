/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Rate limiter to prevent excessive telemetry recording
 * Ensures we don't send metrics more frequently than specified limits
 */
export declare class RateLimiter {
    private lastRecordTimes;
    private readonly minIntervalMs;
    private static readonly HIGH_PRIORITY_DIVISOR;
    constructor(minIntervalMs?: number);
    /**
     * Check if we should record a metric based on rate limiting
     * @param metricKey - Unique key for the metric type/context
     * @param isHighPriority - If true, uses shorter interval for critical events
     * @returns true if metric should be recorded
     */
    shouldRecord(metricKey: string, isHighPriority?: boolean): boolean;
    /**
     * Force record a metric (bypasses rate limiting)
     * Use sparingly for critical events
     */
    forceRecord(metricKey: string): void;
    /**
     * Get time until next allowed recording for a metric
     */
    getTimeUntilNextAllowed(metricKey: string, isHighPriority?: boolean): number;
    /**
     * Get statistics about rate limiting
     */
    getStats(): {
        totalMetrics: number;
        oldestRecord: number;
        newestRecord: number;
        averageInterval: number;
    };
    /**
     * Clear all rate limiting state
     */
    reset(): void;
    /**
     * Remove old entries to prevent memory leaks
     */
    cleanup(maxAgeMs?: number): void;
}
