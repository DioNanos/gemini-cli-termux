/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Returns true after a specified delay of inactivity.
 * Inactivity is defined as 'trigger' not changing for 'delayMs' milliseconds.
 *
 * @param isActive Whether the timer should be running.
 * @param trigger Any value that, when changed, resets the inactivity timer.
 * @param delayMs The delay in milliseconds before considering the state inactive.
 */
export declare const useInactivityTimer: (isActive: boolean, trigger: unknown, delayMs?: number) => boolean;
