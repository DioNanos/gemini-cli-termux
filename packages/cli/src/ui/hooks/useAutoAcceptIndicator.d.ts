/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ApprovalMode, type Config } from '@google/gemini-cli-core';
import type { HistoryItemWithoutId } from '../types.js';
export interface UseAutoAcceptIndicatorArgs {
    config: Config;
    addItem?: (item: HistoryItemWithoutId, timestamp: number) => void;
    onApprovalModeChange?: (mode: ApprovalMode) => void;
    isActive?: boolean;
}
export declare function useAutoAcceptIndicator({ config, addItem, onApprovalModeChange, isActive, }: UseAutoAcceptIndicatorArgs): ApprovalMode;
