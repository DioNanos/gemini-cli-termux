/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config, type FallbackIntent, type UserTierId } from '@google/gemini-cli-core';
import { type UseHistoryManagerReturn } from './useHistoryManager.js';
import { type ProQuotaDialogRequest } from '../contexts/UIStateContext.js';
interface UseQuotaAndFallbackArgs {
    config: Config;
    historyManager: UseHistoryManagerReturn;
    userTier: UserTierId | undefined;
    setModelSwitchedFromQuotaError: (value: boolean) => void;
}
export declare function useQuotaAndFallback({ config, historyManager, userTier, setModelSwitchedFromQuotaError, }: UseQuotaAndFallbackArgs): {
    proQuotaRequest: ProQuotaDialogRequest | null;
    handleProQuotaChoice: (choice: FallbackIntent) => void;
};
export {};
