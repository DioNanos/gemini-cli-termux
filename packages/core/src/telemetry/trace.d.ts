/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type AttributeValue, type SpanOptions } from '@opentelemetry/api';
/**
 * Metadata for a span.
 */
export interface SpanMetadata {
    /** The name of the span. */
    name: string;
    /** The input to the span. */
    input?: unknown;
    /** The output of the span. */
    output?: unknown;
    error?: unknown;
    /** Additional attributes for the span. */
    attributes: Record<string, AttributeValue>;
}
/**
 * Runs a function in a new OpenTelemetry span.
 *
 * The `meta` object will be automatically used to set the span's status and attributes upon completion.
 *
 * @example
 * ```typescript
 * runInDevTraceSpan({ name: 'my-operation' }, ({ metadata }) => {
 *   metadata.input = { foo: 'bar' };
 *   // ... do work ...
 *   metadata.output = { result: 'baz' };
 *   metadata.attributes['my.custom.attribute'] = 'some-value';
 * });
 * ```
 *
 * @param opts The options for the span.
 * @param fn The function to run in the span.
 * @returns The result of the function.
 */
export declare function runInDevTraceSpan<R>(opts: SpanOptions & {
    name: string;
    noAutoEnd?: boolean;
}, fn: ({ metadata, }: {
    metadata: SpanMetadata;
    endSpan: () => void;
}) => Promise<R>): Promise<R>;
