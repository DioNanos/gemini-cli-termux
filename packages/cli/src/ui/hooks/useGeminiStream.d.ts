/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ApprovalMode } from '@google/gemini-cli-core';
import type { Config, EditorType, GeminiClient, ThoughtSummary, RetryAttemptPayload } from '@google/gemini-cli-core';
import { type PartListUnion } from '@google/genai';
import type { HistoryItem, HistoryItemWithoutId, SlashCommandProcessorResult } from '../types.js';
import { StreamingState } from '../types.js';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
import { type TrackedToolCall } from './useReactToolScheduler.js';
import type { LoadedSettings } from '../../config/settings.js';
/**
 * Manages the Gemini stream, including user input, command processing,
 * API interaction, and tool call lifecycle.
 */
export declare const useGeminiStream: (geminiClient: GeminiClient, history: HistoryItem[], addItem: UseHistoryManagerReturn["addItem"], config: Config, settings: LoadedSettings, onDebugMessage: (message: string) => void, handleSlashCommand: (cmd: PartListUnion) => Promise<SlashCommandProcessorResult | false>, shellModeActive: boolean, getPreferredEditor: () => EditorType | undefined, onAuthError: (error: string) => void, performMemoryRefresh: () => Promise<void>, modelSwitchedFromQuotaError: boolean, setModelSwitchedFromQuotaError: React.Dispatch<React.SetStateAction<boolean>>, onCancelSubmit: (shouldRestorePrompt?: boolean) => void, setShellInputFocused: (value: boolean) => void, terminalWidth: number, terminalHeight: number, isShellFocused?: boolean) => {
    streamingState: StreamingState;
    submitQuery: (query: PartListUnion, options?: {
        isContinuation: boolean;
    }, prompt_id?: string) => Promise<void>;
    initError: string | null;
    pendingHistoryItems: HistoryItemWithoutId[];
    thought: ThoughtSummary | null;
    cancelOngoingRequest: () => void;
    pendingToolCalls: TrackedToolCall[];
    handleApprovalModeChange: (newApprovalMode: ApprovalMode) => Promise<void>;
    activePtyId: number | undefined;
    loopDetectionConfirmationRequest: {
        onComplete: (result: {
            userSelection: "disable" | "keep";
        }) => void;
    } | null;
    lastOutputTime: number;
    retryStatus: RetryAttemptPayload | null;
};
