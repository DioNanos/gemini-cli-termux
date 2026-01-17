/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type JWTInput } from 'google-auth-library';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter';
import type { ExportResult } from '@opentelemetry/core';
import type { ReadableLogRecord, LogRecordExporter } from '@opentelemetry/sdk-logs';
/**
 * Google Cloud Trace exporter that extends the official trace exporter
 */
export declare class GcpTraceExporter extends TraceExporter {
    constructor(projectId?: string, credentials?: JWTInput);
}
/**
 * Google Cloud Monitoring exporter that extends the official metrics exporter
 */
export declare class GcpMetricExporter extends MetricExporter {
    constructor(projectId?: string, credentials?: JWTInput);
}
/**
 * Google Cloud Logging exporter that uses the Cloud Logging client
 */
export declare class GcpLogExporter implements LogRecordExporter {
    private logging;
    private log;
    private pendingWrites;
    constructor(projectId?: string, credentials?: JWTInput);
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void;
    forceFlush(): Promise<void>;
    shutdown(): Promise<void>;
    private mapSeverityToCloudLogging;
}
