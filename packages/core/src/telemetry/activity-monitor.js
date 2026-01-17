/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { isPerformanceMonitoringActive } from './metrics.js';
import { getMemoryMonitor } from './memory-monitor.js';
import { ActivityType } from './activity-types.js';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Default configuration for activity monitoring
 */
export const DEFAULT_ACTIVITY_CONFIG = {
    enabled: true,
    snapshotThrottleMs: 1000, // 1 second minimum between snapshots
    maxEventBuffer: 100,
    triggerActivities: [
        ActivityType.USER_INPUT_START,
        ActivityType.MESSAGE_ADDED,
        ActivityType.TOOL_CALL_SCHEDULED,
        ActivityType.STREAM_START,
    ],
};
/**
 * Activity monitor class that tracks user activity and triggers memory monitoring
 */
export class ActivityMonitor {
    listeners = new Set();
    eventBuffer = [];
    lastSnapshotTime = 0;
    config;
    isActive = false;
    memoryMonitoringListener = null;
    constructor(config = DEFAULT_ACTIVITY_CONFIG) {
        this.config = { ...config };
    }
    /**
     * Start activity monitoring
     */
    start(coreConfig) {
        if (!isPerformanceMonitoringActive() || this.isActive) {
            return;
        }
        this.isActive = true;
        // Register default memory monitoring listener
        this.memoryMonitoringListener = (event) => {
            this.handleMemoryMonitoringActivity(event, coreConfig);
        };
        this.addListener(this.memoryMonitoringListener);
        // Record activity monitoring start
        this.recordActivity(ActivityType.MANUAL_TRIGGER, 'activity_monitoring_start');
    }
    /**
     * Stop activity monitoring
     */
    stop() {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        if (this.memoryMonitoringListener) {
            this.removeListener(this.memoryMonitoringListener);
            this.memoryMonitoringListener = null;
        }
        this.eventBuffer = [];
    }
    /**
     * Add an activity listener
     */
    addListener(listener) {
        this.listeners.add(listener);
    }
    /**
     * Remove an activity listener
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    /**
     * Record a user activity event
     */
    recordActivity(type, context, metadata) {
        if (!this.isActive || !this.config.enabled) {
            return;
        }
        const event = {
            type,
            timestamp: Date.now(),
            context,
            metadata,
        };
        // Add to buffer
        this.eventBuffer.push(event);
        if (this.eventBuffer.length > this.config.maxEventBuffer) {
            this.eventBuffer.shift(); // Remove oldest event
        }
        // Notify listeners
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            }
            catch (error) {
                // Silently catch listener errors to avoid disrupting the application
                debugLogger.debug('ActivityMonitor listener error:', error);
            }
        });
    }
    /**
     * Get recent activity events
     */
    getRecentActivity(limit) {
        const events = [...this.eventBuffer];
        return limit ? events.slice(-limit) : events;
    }
    /**
     * Get activity statistics
     */
    getActivityStats() {
        const eventTypes = {};
        let start = Number.MAX_SAFE_INTEGER;
        let end = 0;
        for (const event of this.eventBuffer) {
            eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
            start = Math.min(start, event.timestamp);
            end = Math.max(end, event.timestamp);
        }
        return {
            totalEvents: this.eventBuffer.length,
            eventTypes,
            timeRange: this.eventBuffer.length > 0 ? { start, end } : null,
        };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Handle memory monitoring for activity events
     */
    handleMemoryMonitoringActivity(event, config) {
        // Check if this activity type should trigger memory monitoring
        if (!this.config.triggerActivities.includes(event.type)) {
            return;
        }
        // Throttle memory snapshots
        const now = Date.now();
        if (now - this.lastSnapshotTime < this.config.snapshotThrottleMs) {
            return;
        }
        this.lastSnapshotTime = now;
        // Take memory snapshot
        const memoryMonitor = getMemoryMonitor();
        if (memoryMonitor) {
            const context = event.context
                ? `activity_${event.type}_${event.context}`
                : `activity_${event.type}`;
            memoryMonitor.takeSnapshot(context, config);
        }
    }
    /**
     * Check if monitoring is active
     */
    isMonitoringActive() {
        return this.isActive && this.config.enabled;
    }
}
// Singleton instance for global activity monitoring
let globalActivityMonitor = null;
/**
 * Initialize global activity monitor
 */
export function initializeActivityMonitor(config) {
    if (!globalActivityMonitor) {
        globalActivityMonitor = new ActivityMonitor(config);
    }
    return globalActivityMonitor;
}
/**
 * Get global activity monitor instance
 */
export function getActivityMonitor() {
    return globalActivityMonitor;
}
/**
 * Record a user activity on the global monitor (convenience function)
 */
export function recordGlobalActivity(type, context, metadata) {
    if (globalActivityMonitor) {
        globalActivityMonitor.recordActivity(type, context, metadata);
    }
}
/**
 * Start global activity monitoring
 */
export function startGlobalActivityMonitoring(coreConfig, activityConfig) {
    const monitor = initializeActivityMonitor(activityConfig);
    monitor.start(coreConfig);
}
/**
 * Stop global activity monitoring
 */
export function stopGlobalActivityMonitoring() {
    if (globalActivityMonitor) {
        globalActivityMonitor.stop();
    }
}
//# sourceMappingURL=activity-monitor.js.map