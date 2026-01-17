/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { StreamingState } from '../types.js';
export interface UseMessageQueueOptions {
    isConfigInitialized: boolean;
    streamingState: StreamingState;
    submitQuery: (query: string) => void;
}
export interface UseMessageQueueReturn {
    messageQueue: string[];
    addMessage: (message: string) => void;
    clearQueue: () => void;
    getQueuedMessagesText: () => string;
    popAllMessages: () => string | undefined;
}
/**
 * Hook for managing message queuing during streaming responses.
 * Allows users to queue messages while the AI is responding and automatically
 * sends them when streaming completes.
 */
export declare function useMessageQueue({ isConfigInitialized, streamingState, submitQuery, }: UseMessageQueueOptions): UseMessageQueueReturn;
