/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { SessionMetrics, ModelMetrics } from '@google/gemini-cli-core';
export declare enum ToolCallDecision {
    ACCEPT = "accept",
    REJECT = "reject",
    MODIFY = "modify",
    AUTO_ACCEPT = "auto_accept"
}
export type { SessionMetrics, ModelMetrics };
export interface SessionStatsState {
    sessionId: string;
    sessionStartTime: Date;
    metrics: SessionMetrics;
    lastPromptTokenCount: number;
    promptCount: number;
}
export interface ComputedSessionStats {
    totalApiTime: number;
    totalToolTime: number;
    agentActiveTime: number;
    apiTimePercent: number;
    toolTimePercent: number;
    cacheEfficiency: number;
    totalDecisions: number;
    successRate: number;
    agreementRate: number;
    totalCachedTokens: number;
    totalInputTokens: number;
    totalPromptTokens: number;
    totalLinesAdded: number;
    totalLinesRemoved: number;
}
interface SessionStatsContextValue {
    stats: SessionStatsState;
    startNewPrompt: () => void;
    getPromptCount: () => number;
}
export declare const SessionStatsProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useSessionStats: () => SessionStatsContextValue;
