/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { JsonStreamEvent, StreamStats } from './types.js';
import type { SessionMetrics } from '../telemetry/uiTelemetry.js';
/**
 * Formatter for streaming JSON output.
 * Emits newline-delimited JSON (JSONL) events to stdout in real-time.
 */
export declare class StreamJsonFormatter {
    /**
     * Formats a single event as a JSON string with newline (JSONL format).
     * @param event - The stream event to format
     * @returns JSON string with trailing newline
     */
    formatEvent(event: JsonStreamEvent): string;
    /**
     * Emits an event directly to stdout in JSONL format.
     * @param event - The stream event to emit
     */
    emitEvent(event: JsonStreamEvent): void;
    /**
     * Converts SessionMetrics to simplified StreamStats format.
     * Aggregates token counts across all models.
     * @param metrics - The session metrics from telemetry
     * @param durationMs - The session duration in milliseconds
     * @returns Simplified stats for streaming output
     */
    convertToStreamStats(metrics: SessionMetrics, durationMs: number): StreamStats;
}
