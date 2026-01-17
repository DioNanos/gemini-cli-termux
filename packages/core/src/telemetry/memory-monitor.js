/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import v8 from 'node:v8';
import process from 'node:process';
import { bytesToMB } from '../utils/formatters.js';
import { isUserActive } from './activity-detector.js';
import { HighWaterMarkTracker } from './high-water-mark-tracker.js';
import { recordMemoryUsage, MemoryMetricType, isPerformanceMonitoringActive, } from './metrics.js';
import { RateLimiter } from './rate-limiter.js';
export class MemoryMonitor {
    intervalId = null;
    isRunning = false;
    lastSnapshot = null;
    monitoringInterval = 10000;
    highWaterMarkTracker;
    rateLimiter;
    useEnhancedMonitoring = true;
    lastCleanupTimestamp = Date.now();
    static STATE_CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
    static STATE_CLEANUP_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
    constructor() {
        // No config stored to avoid multi-session attribution issues
        this.highWaterMarkTracker = new HighWaterMarkTracker(5); // 5% threshold
        this.rateLimiter = new RateLimiter(60000); // 1 minute minimum between recordings
    }
    /**
     * Start continuous memory monitoring
     */
    start(config, intervalMs = 10000) {
        if (!isPerformanceMonitoringActive() || this.isRunning) {
            return;
        }
        this.monitoringInterval = intervalMs;
        this.isRunning = true;
        // Take initial snapshot
        this.takeSnapshot('monitoring_start', config);
        // Set up periodic monitoring with enhanced logic
        this.intervalId = setInterval(() => {
            this.checkAndRecordIfNeeded(config);
        }, this.monitoringInterval).unref();
    }
    /**
     * Check if we should record memory metrics and do so if conditions are met
     */
    checkAndRecordIfNeeded(config) {
        this.performPeriodicCleanup();
        if (!this.useEnhancedMonitoring) {
            // Fall back to original behavior
            this.takeSnapshot('periodic', config);
            return;
        }
        // Only proceed if user is active
        if (!isUserActive()) {
            return;
        }
        // Get current memory usage
        const currentMemory = this.getCurrentMemoryUsage();
        // Check if RSS has grown significantly (5% threshold)
        const shouldRecordRss = this.highWaterMarkTracker.shouldRecordMetric('rss', currentMemory.rss);
        const shouldRecordHeap = this.highWaterMarkTracker.shouldRecordMetric('heap_used', currentMemory.heapUsed);
        // Also check rate limiting
        const canRecordPeriodic = this.rateLimiter.shouldRecord('periodic_memory');
        const canRecordHighWater = this.rateLimiter.shouldRecord('high_water_memory', true); // High priority
        // Record if we have significant growth and aren't rate limited
        if ((shouldRecordRss || shouldRecordHeap) && canRecordHighWater) {
            const context = shouldRecordRss ? 'rss_growth' : 'heap_growth';
            this.takeSnapshot(context, config);
        }
        else if (canRecordPeriodic) {
            // Occasionally record even without growth for baseline tracking
            this.takeSnapshotWithoutRecording('periodic_check', config);
        }
    }
    /**
     * Periodically prune tracker state to avoid unbounded growth when keys change.
     */
    performPeriodicCleanup() {
        const now = Date.now();
        if (now - this.lastCleanupTimestamp <
            MemoryMonitor.STATE_CLEANUP_INTERVAL_MS) {
            return;
        }
        this.lastCleanupTimestamp = now;
        this.highWaterMarkTracker.cleanup(MemoryMonitor.STATE_CLEANUP_MAX_AGE_MS);
        this.rateLimiter.cleanup(MemoryMonitor.STATE_CLEANUP_MAX_AGE_MS);
    }
    /**
     * Stop continuous memory monitoring
     */
    stop(config) {
        if (!this.isRunning) {
            return;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Take final snapshot if config is provided
        if (config) {
            this.takeSnapshot('monitoring_stop', config);
        }
        this.isRunning = false;
    }
    /**
     * Take a memory snapshot and record metrics
     */
    takeSnapshot(context, config) {
        const memUsage = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        const snapshot = {
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss,
            arrayBuffers: memUsage.arrayBuffers,
            heapSizeLimit: heapStats.heap_size_limit,
        };
        // Record memory metrics if monitoring is active
        if (isPerformanceMonitoringActive()) {
            recordMemoryUsage(config, snapshot.heapUsed, {
                memory_type: MemoryMetricType.HEAP_USED,
                component: context,
            });
            recordMemoryUsage(config, snapshot.heapTotal, {
                memory_type: MemoryMetricType.HEAP_TOTAL,
                component: context,
            });
            recordMemoryUsage(config, snapshot.external, {
                memory_type: MemoryMetricType.EXTERNAL,
                component: context,
            });
            recordMemoryUsage(config, snapshot.rss, {
                memory_type: MemoryMetricType.RSS,
                component: context,
            });
        }
        this.lastSnapshot = snapshot;
        return snapshot;
    }
    /**
     * Take a memory snapshot without recording metrics (for internal tracking)
     */
    takeSnapshotWithoutRecording(_context, _config) {
        const memUsage = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        const snapshot = {
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss,
            arrayBuffers: memUsage.arrayBuffers,
            heapSizeLimit: heapStats.heap_size_limit,
        };
        // Update internal tracking but don't record metrics
        this.highWaterMarkTracker.shouldRecordMetric('rss', snapshot.rss);
        this.highWaterMarkTracker.shouldRecordMetric('heap_used', snapshot.heapUsed);
        this.lastSnapshot = snapshot;
        return snapshot;
    }
    /**
     * Get current memory usage without recording metrics
     */
    getCurrentMemoryUsage() {
        const memUsage = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        return {
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss,
            arrayBuffers: memUsage.arrayBuffers,
            heapSizeLimit: heapStats.heap_size_limit,
        };
    }
    /**
     * Get memory growth since last snapshot
     */
    getMemoryGrowth() {
        if (!this.lastSnapshot) {
            return null;
        }
        const current = this.getCurrentMemoryUsage();
        return {
            heapUsed: current.heapUsed - this.lastSnapshot.heapUsed,
            heapTotal: current.heapTotal - this.lastSnapshot.heapTotal,
            external: current.external - this.lastSnapshot.external,
            rss: current.rss - this.lastSnapshot.rss,
            arrayBuffers: current.arrayBuffers - this.lastSnapshot.arrayBuffers,
        };
    }
    /**
     * Get detailed heap statistics
     */
    getHeapStatistics() {
        return v8.getHeapStatistics();
    }
    /**
     * Get heap space statistics
     */
    getHeapSpaceStatistics() {
        return v8.getHeapSpaceStatistics();
    }
    /**
     * Get process CPU and memory metrics
     */
    getProcessMetrics() {
        return {
            cpuUsage: process.cpuUsage(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
        };
    }
    /**
     * Record memory usage for a specific component or operation
     */
    recordComponentMemoryUsage(config, component, operation) {
        const snapshot = this.takeSnapshot(operation ? `${component}_${operation}` : component, config);
        return snapshot;
    }
    /**
     * Check if memory usage exceeds threshold
     */
    checkMemoryThreshold(thresholdMB) {
        const current = this.getCurrentMemoryUsage();
        const currentMB = bytesToMB(current.heapUsed);
        return currentMB > thresholdMB;
    }
    /**
     * Get memory usage summary in MB
     */
    getMemoryUsageSummary() {
        const current = this.getCurrentMemoryUsage();
        return {
            heapUsedMB: Math.round(bytesToMB(current.heapUsed) * 100) / 100,
            heapTotalMB: Math.round(bytesToMB(current.heapTotal) * 100) / 100,
            externalMB: Math.round(bytesToMB(current.external) * 100) / 100,
            rssMB: Math.round(bytesToMB(current.rss) * 100) / 100,
            heapSizeLimitMB: Math.round(bytesToMB(current.heapSizeLimit) * 100) / 100,
        };
    }
    /**
     * Enable or disable enhanced monitoring features
     */
    setEnhancedMonitoring(enabled) {
        this.useEnhancedMonitoring = enabled;
    }
    /**
     * Get high-water mark statistics
     */
    getHighWaterMarkStats() {
        return this.highWaterMarkTracker.getAllHighWaterMarks();
    }
    /**
     * Get rate limiting statistics
     */
    getRateLimitingStats() {
        return this.rateLimiter.getStats();
    }
    /**
     * Force record memory metrics (bypasses rate limiting for critical events)
     */
    forceRecordMemory(config, context = 'forced') {
        this.rateLimiter.forceRecord('forced_memory');
        return this.takeSnapshot(context, config);
    }
    /**
     * Reset high-water marks (useful after memory optimizations)
     */
    resetHighWaterMarks() {
        this.highWaterMarkTracker.resetAllHighWaterMarks();
    }
    /**
     * Cleanup resources
     */
    destroy() {
        this.stop();
        this.rateLimiter.reset();
        this.highWaterMarkTracker.resetAllHighWaterMarks();
    }
}
// Singleton instance for global memory monitoring
let globalMemoryMonitor = null;
/**
 * Initialize global memory monitor
 */
export function initializeMemoryMonitor() {
    if (!globalMemoryMonitor) {
        globalMemoryMonitor = new MemoryMonitor();
    }
    return globalMemoryMonitor;
}
/**
 * Get global memory monitor instance
 */
export function getMemoryMonitor() {
    return globalMemoryMonitor;
}
/**
 * Record memory usage for current operation
 */
export function recordCurrentMemoryUsage(config, context) {
    const monitor = initializeMemoryMonitor();
    return monitor.takeSnapshot(context, config);
}
/**
 * Start global memory monitoring
 */
export function startGlobalMemoryMonitoring(config, intervalMs = 10000) {
    const monitor = initializeMemoryMonitor();
    monitor.start(config, intervalMs);
}
/**
 * Stop global memory monitoring
 */
export function stopGlobalMemoryMonitoring(config) {
    if (globalMemoryMonitor) {
        globalMemoryMonitor.stop(config);
    }
}
/**
 * Reset the global memory monitor singleton (test-only helper).
 */
export function _resetGlobalMemoryMonitorForTests() {
    if (globalMemoryMonitor) {
        globalMemoryMonitor.destroy();
    }
    globalMemoryMonitor = null;
}
//# sourceMappingURL=memory-monitor.js.map