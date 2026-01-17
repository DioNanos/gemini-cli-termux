/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { StreamingState } from '../types.js';
import { type RetryAttemptPayload } from '@google/gemini-cli-core';
export declare const useLoadingIndicator: (streamingState: StreamingState, customWittyPhrases?: string[], isInteractiveShellWaiting?: boolean, lastOutputTime?: number, retryStatus?: RetryAttemptPayload | null) => {
    elapsedTime: number;
    currentLoadingPhrase: string;
};
