/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { JWTInput } from 'google-auth-library';
import type { Config } from '../config/config.js';
export declare function isTelemetrySdkInitialized(): boolean;
export declare function bufferTelemetryEvent(fn: () => void | Promise<void>): void;
export declare function initializeTelemetry(config: Config, credentials?: JWTInput): Promise<void>;
/**
 * Force flush all pending telemetry data to disk.
 * This is useful for ensuring telemetry is written before critical operations like /clear.
 */
export declare function flushTelemetry(config: Config): Promise<void>;
export declare function shutdownTelemetry(config: Config, fromProcessExit?: boolean): Promise<void>;
