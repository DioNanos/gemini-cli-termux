/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export interface TermuxEnvironment {
    isTermux: boolean;
    hasTermuxApi: boolean;
    apiVersion?: string;
    prefix: string;
    availableCommands: string[];
}
/**
 * Detect if running in Termux environment
 */
export declare function isTermux(): boolean;
/**
 * Detect full Termux environment including API availability
 */
export declare function detectTermuxEnvironment(): TermuxEnvironment;
