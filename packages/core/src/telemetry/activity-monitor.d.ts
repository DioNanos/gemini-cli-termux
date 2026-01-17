/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import { ActivityType } from './activity-types.js';
/**
 * Activity event data structure
 */
export interface ActivityEvent {
    type: ActivityType;
    timestamp: number;
    context?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Configuration for activity monitoring
 */
export interface ActivityMonitorConfig {
    /** Enable/disable activity monitoring */
    enabled: boolean;
    /** Minimum interval between memory snapshots (ms) */
    snapshotThrottleMs: number;
    /** Maximum number of events to buffer */
    maxEventBuffer: number;
    /** Activity types that should trigger immediate memory snapshots */
    triggerActivities: ActivityType[];
}
/**
 * Activity listener callback function
 */
export type ActivityListener = (event: ActivityEvent) => void;
/**
 * Default configuration for activity monitoring
 */
export declare const DEFAULT_ACTIVITY_CONFIG: ActivityMonitorConfig;
/**
 * Activity monitor class that tracks user activity and triggers memory monitoring
 */
export declare class ActivityMonitor {
    private listeners;
    private eventBuffer;
    private lastSnapshotTime;
    private config;
    private isActive;
    private memoryMonitoringListener;
    constructor(config?: ActivityMonitorConfig);
    /**
     * Start activity monitoring
     */
    start(coreConfig: Config): void;
    /**
     * Stop activity monitoring
     */
    stop(): void;
    /**
     * Add an activity listener
     */
    addListener(listener: ActivityListener): void;
    /**
     * Remove an activity listener
     */
    removeListener(listener: ActivityListener): void;
    /**
     * Record a user activity event
     */
    recordActivity(type: ActivityType, context?: string, metadata?: Record<string, unknown>): void;
    /**
     * Get recent activity events
     */
    getRecentActivity(limit?: number): ActivityEvent[];
    /**
     * Get activity statistics
     */
    getActivityStats(): {
        totalEvents: number;
        eventTypes: Record<ActivityType, number>;
        timeRange: {
            start: number;
            end: number;
        } | null;
    };
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ActivityMonitorConfig>): void;
    /**
     * Handle memory monitoring for activity events
     */
    private handleMemoryMonitoringActivity;
    /**
     * Check if monitoring is active
     */
    isMonitoringActive(): boolean;
}
/**
 * Initialize global activity monitor
 */
export declare function initializeActivityMonitor(config?: ActivityMonitorConfig): ActivityMonitor;
/**
 * Get global activity monitor instance
 */
export declare function getActivityMonitor(): ActivityMonitor | null;
/**
 * Record a user activity on the global monitor (convenience function)
 */
export declare function recordGlobalActivity(type: ActivityType, context?: string, metadata?: Record<string, unknown>): void;
/**
 * Start global activity monitoring
 */
export declare function startGlobalActivityMonitoring(coreConfig: Config, activityConfig?: ActivityMonitorConfig): void;
/**
 * Stop global activity monitoring
 */
export declare function stopGlobalActivityMonitoring(): void;
