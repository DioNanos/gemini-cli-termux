/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import v8 from 'node:v8';
import type { Config } from '../config/config.js';
export interface MemorySnapshot {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers: number;
    heapSizeLimit: number;
}
export interface ProcessMetrics {
    cpuUsage: NodeJS.CpuUsage;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
}
export declare class MemoryMonitor {
    private intervalId;
    private isRunning;
    private lastSnapshot;
    private monitoringInterval;
    private highWaterMarkTracker;
    private rateLimiter;
    private useEnhancedMonitoring;
    private lastCleanupTimestamp;
    private static readonly STATE_CLEANUP_INTERVAL_MS;
    private static readonly STATE_CLEANUP_MAX_AGE_MS;
    constructor();
    /**
     * Start continuous memory monitoring
     */
    start(config: Config, intervalMs?: number): void;
    /**
     * Check if we should record memory metrics and do so if conditions are met
     */
    private checkAndRecordIfNeeded;
    /**
     * Periodically prune tracker state to avoid unbounded growth when keys change.
     */
    private performPeriodicCleanup;
    /**
     * Stop continuous memory monitoring
     */
    stop(config?: Config): void;
    /**
     * Take a memory snapshot and record metrics
     */
    takeSnapshot(context: string, config: Config): MemorySnapshot;
    /**
     * Take a memory snapshot without recording metrics (for internal tracking)
     */
    private takeSnapshotWithoutRecording;
    /**
     * Get current memory usage without recording metrics
     */
    getCurrentMemoryUsage(): MemorySnapshot;
    /**
     * Get memory growth since last snapshot
     */
    getMemoryGrowth(): Partial<MemorySnapshot> | null;
    /**
     * Get detailed heap statistics
     */
    getHeapStatistics(): v8.HeapInfo;
    /**
     * Get heap space statistics
     */
    getHeapSpaceStatistics(): v8.HeapSpaceInfo[];
    /**
     * Get process CPU and memory metrics
     */
    getProcessMetrics(): ProcessMetrics;
    /**
     * Record memory usage for a specific component or operation
     */
    recordComponentMemoryUsage(config: Config, component: string, operation?: string): MemorySnapshot;
    /**
     * Check if memory usage exceeds threshold
     */
    checkMemoryThreshold(thresholdMB: number): boolean;
    /**
     * Get memory usage summary in MB
     */
    getMemoryUsageSummary(): {
        heapUsedMB: number;
        heapTotalMB: number;
        externalMB: number;
        rssMB: number;
        heapSizeLimitMB: number;
    };
    /**
     * Enable or disable enhanced monitoring features
     */
    setEnhancedMonitoring(enabled: boolean): void;
    /**
     * Get high-water mark statistics
     */
    getHighWaterMarkStats(): Record<string, number>;
    /**
     * Get rate limiting statistics
     */
    getRateLimitingStats(): {
        totalMetrics: number;
        oldestRecord: number;
        newestRecord: number;
        averageInterval: number;
    };
    /**
     * Force record memory metrics (bypasses rate limiting for critical events)
     */
    forceRecordMemory(config: Config, context?: string): MemorySnapshot;
    /**
     * Reset high-water marks (useful after memory optimizations)
     */
    resetHighWaterMarks(): void;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
/**
 * Initialize global memory monitor
 */
export declare function initializeMemoryMonitor(): MemoryMonitor;
/**
 * Get global memory monitor instance
 */
export declare function getMemoryMonitor(): MemoryMonitor | null;
/**
 * Record memory usage for current operation
 */
export declare function recordCurrentMemoryUsage(config: Config, context: string): MemorySnapshot;
/**
 * Start global memory monitoring
 */
export declare function startGlobalMemoryMonitoring(config: Config, intervalMs?: number): void;
/**
 * Stop global memory monitoring
 */
export declare function stopGlobalMemoryMonitoring(config?: Config): void;
/**
 * Reset the global memory monitor singleton (test-only helper).
 */
export declare function _resetGlobalMemoryMonitorForTests(): void;
