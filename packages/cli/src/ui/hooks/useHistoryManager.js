/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useCallback, useMemo } from 'react';
/**
 * Custom hook to manage the chat history state.
 *
 * Encapsulates the history array, message ID generation, adding items,
 * updating items, and clearing the history.
 */
export function useHistory({ chatRecordingService, } = {}) {
    const [history, setHistory] = useState([]);
    const messageIdCounterRef = useRef(0);
    // Generates a unique message ID based on a timestamp and a counter.
    const getNextMessageId = useCallback((baseTimestamp) => {
        messageIdCounterRef.current += 1;
        return baseTimestamp + messageIdCounterRef.current;
    }, []);
    const loadHistory = useCallback((newHistory) => {
        setHistory(newHistory);
    }, []);
    // Adds a new item to the history state with a unique ID.
    const addItem = useCallback((itemData, baseTimestamp = Date.now(), isResuming = false) => {
        const id = getNextMessageId(baseTimestamp);
        const newItem = { ...itemData, id };
        setHistory((prevHistory) => {
            if (prevHistory.length > 0) {
                const lastItem = prevHistory[prevHistory.length - 1];
                // Prevent adding duplicate consecutive user messages
                if (lastItem.type === 'user' &&
                    newItem.type === 'user' &&
                    lastItem.text === newItem.text) {
                    return prevHistory; // Don't add the duplicate
                }
            }
            return [...prevHistory, newItem];
        });
        // Record UI-specific messages, but don't do it if we're actually loading
        // an existing session.
        if (!isResuming && chatRecordingService) {
            switch (itemData.type) {
                case 'compression':
                case 'info':
                    chatRecordingService?.recordMessage({
                        model: undefined,
                        type: 'info',
                        content: itemData.text ?? '',
                    });
                    break;
                case 'warning':
                    chatRecordingService?.recordMessage({
                        model: undefined,
                        type: 'warning',
                        content: itemData.text ?? '',
                    });
                    break;
                case 'error':
                    chatRecordingService?.recordMessage({
                        model: undefined,
                        type: 'error',
                        content: itemData.text ?? '',
                    });
                    break;
                case 'user':
                case 'gemini':
                case 'gemini_content':
                    // Core conversation recording handled by GeminiChat.
                    break;
                default:
                    // Ignore the rest.
                    break;
            }
        }
        return id; // Return the generated ID (even if not added, to keep signature)
    }, [getNextMessageId, chatRecordingService]);
    /**
     * Updates an existing history item identified by its ID.
     * @deprecated Prefer not to update history item directly as we are currently
     * rendering all history items in <Static /> for performance reasons. Only use
     * if ABSOLUTELY NECESSARY
     */
    //
    const updateItem = useCallback((id, updates) => {
        setHistory((prevHistory) => prevHistory.map((item) => {
            if (item.id === id) {
                // Apply updates based on whether it's an object or a function
                const newUpdates = typeof updates === 'function' ? updates(item) : updates;
                return { ...item, ...newUpdates };
            }
            return item;
        }));
    }, []);
    // Clears the entire history state and resets the ID counter.
    const clearItems = useCallback(() => {
        setHistory([]);
        messageIdCounterRef.current = 0;
    }, []);
    return useMemo(() => ({
        history,
        addItem,
        updateItem,
        clearItems,
        loadHistory,
    }), [history, addItem, updateItem, clearItems, loadHistory]);
}
//# sourceMappingURL=useHistoryManager.js.map