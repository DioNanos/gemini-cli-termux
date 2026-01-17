/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { EventEmitter } from 'node:events';
import type { Config } from '@google/gemini-cli-core';
export interface NetworkLog {
    id: string;
    timestamp: number;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    pending?: boolean;
    response?: {
        status: number;
        headers: Record<string, string>;
        body?: string;
        durationMs: number;
    };
    error?: string;
}
/**
 * Capture utility for session activities (network and console).
 * Provides a stream of events that can be persisted for analysis or inspection.
 */
export declare class ActivityLogger extends EventEmitter {
    private static instance;
    private isInterceptionEnabled;
    private requestStartTimes;
    static getInstance(): ActivityLogger;
    private stringifyHeaders;
    private sanitizeNetworkLog;
    private safeEmitNetwork;
    enable(): void;
    private patchGlobalFetch;
    private patchNodeHttp;
    logConsole(payload: unknown): void;
}
/**
 * Registers the activity logger if debug mode and interactive session are enabled.
 * Captures network and console logs to a session-specific JSONL file.
 *
 * @param config The CLI configuration
 */
export declare function registerActivityLogger(config: Config): void;
