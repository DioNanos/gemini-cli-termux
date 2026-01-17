/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config, ToolCallRequestInfo, ExecutingToolCall, ScheduledToolCall, ValidatingToolCall, WaitingToolCall, CompletedToolCall, CancelledToolCall, EditorType } from '@google/gemini-cli-core';
import type { HistoryItemToolGroup } from '../types.js';
export type ScheduleFn = (request: ToolCallRequestInfo | ToolCallRequestInfo[], signal: AbortSignal) => Promise<void>;
export type MarkToolsAsSubmittedFn = (callIds: string[]) => void;
export type TrackedScheduledToolCall = ScheduledToolCall & {
    responseSubmittedToGemini?: boolean;
};
export type TrackedValidatingToolCall = ValidatingToolCall & {
    responseSubmittedToGemini?: boolean;
};
export type TrackedWaitingToolCall = WaitingToolCall & {
    responseSubmittedToGemini?: boolean;
};
export type TrackedExecutingToolCall = ExecutingToolCall & {
    responseSubmittedToGemini?: boolean;
    pid?: number;
};
export type TrackedCompletedToolCall = CompletedToolCall & {
    responseSubmittedToGemini?: boolean;
};
export type TrackedCancelledToolCall = CancelledToolCall & {
    responseSubmittedToGemini?: boolean;
};
export type TrackedToolCall = TrackedScheduledToolCall | TrackedValidatingToolCall | TrackedWaitingToolCall | TrackedExecutingToolCall | TrackedCompletedToolCall | TrackedCancelledToolCall;
export type CancelAllFn = (signal: AbortSignal) => void;
export declare function useReactToolScheduler(onComplete: (tools: CompletedToolCall[]) => Promise<void>, config: Config, getPreferredEditor: () => EditorType | undefined): [
    TrackedToolCall[],
    ScheduleFn,
    MarkToolsAsSubmittedFn,
    React.Dispatch<React.SetStateAction<TrackedToolCall[]>>,
    CancelAllFn,
    number
];
/**
 * Transforms `TrackedToolCall` objects into `HistoryItemToolGroup` objects for UI display.
 */
export declare function mapToDisplay(toolOrTools: TrackedToolCall[] | TrackedToolCall): HistoryItemToolGroup;
