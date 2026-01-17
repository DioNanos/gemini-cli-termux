/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Tracks user activity state to determine when memory monitoring should be active
 */
export declare class ActivityDetector {
    private lastActivityTime;
    private readonly idleThresholdMs;
    constructor(idleThresholdMs?: number);
    /**
     * Record user activity (called by CLI when user types, adds messages, etc.)
     */
    recordActivity(): void;
    /**
     * Check if user is currently active (activity within idle threshold)
     */
    isUserActive(): boolean;
    /**
     * Get time since last activity in milliseconds
     */
    getTimeSinceLastActivity(): number;
    /**
     * Get last activity timestamp
     */
    getLastActivityTime(): number;
}
/**
 * Get global activity detector instance
 */
export declare function getActivityDetector(): ActivityDetector;
/**
 * Record user activity (convenience function for CLI to call)
 */
export declare function recordUserActivity(): void;
/**
 * Check if user is currently active (convenience function)
 */
export declare function isUserActive(): boolean;
