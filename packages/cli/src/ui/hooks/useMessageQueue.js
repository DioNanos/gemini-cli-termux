/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useEffect, useState } from 'react';
import { StreamingState } from '../types.js';
/**
 * Hook for managing message queuing during streaming responses.
 * Allows users to queue messages while the AI is responding and automatically
 * sends them when streaming completes.
 */
export function useMessageQueue({ isConfigInitialized, streamingState, submitQuery, }) {
    const [messageQueue, setMessageQueue] = useState([]);
    // Add a message to the queue
    const addMessage = useCallback((message) => {
        const trimmedMessage = message.trim();
        if (trimmedMessage.length > 0) {
            setMessageQueue((prev) => [...prev, trimmedMessage]);
        }
    }, []);
    // Clear the entire queue
    const clearQueue = useCallback(() => {
        setMessageQueue([]);
    }, []);
    // Get all queued messages as a single text string
    const getQueuedMessagesText = useCallback(() => {
        if (messageQueue.length === 0)
            return '';
        return messageQueue.join('\n\n');
    }, [messageQueue]);
    // Pop all messages from the queue and return them as a single string
    const popAllMessages = useCallback(() => {
        if (messageQueue.length === 0) {
            return undefined;
        }
        const allMessages = messageQueue.join('\n\n');
        setMessageQueue([]);
        return allMessages;
    }, [messageQueue]);
    // Process queued messages when streaming becomes idle
    useEffect(() => {
        if (isConfigInitialized &&
            streamingState === StreamingState.Idle &&
            messageQueue.length > 0) {
            // Combine all messages with double newlines for clarity
            const combinedMessage = messageQueue.join('\n\n');
            // Clear the queue and submit
            setMessageQueue([]);
            submitQuery(combinedMessage);
        }
    }, [isConfigInitialized, streamingState, messageQueue, submitQuery]);
    return {
        messageQueue,
        addMessage,
        clearQueue,
        getQueuedMessagesText,
        popAllMessages,
    };
}
//# sourceMappingURL=useMessageQueue.js.map