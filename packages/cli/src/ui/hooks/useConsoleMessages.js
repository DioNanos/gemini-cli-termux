/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useEffect, useReducer, useRef, useTransition, } from 'react';
import { coreEvents, CoreEvent, } from '@google/gemini-cli-core';
function consoleMessagesReducer(state, action) {
    switch (action.type) {
        case 'ADD_MESSAGES': {
            const newMessages = [...state];
            for (const queuedMessage of action.payload) {
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage &&
                    lastMessage.type === queuedMessage.type &&
                    lastMessage.content === queuedMessage.content) {
                    // Create a new object for the last message to ensure React detects
                    // the change, preventing mutation of the existing state object.
                    newMessages[newMessages.length - 1] = {
                        ...lastMessage,
                        count: lastMessage.count + 1,
                    };
                }
                else {
                    newMessages.push({ ...queuedMessage, count: 1 });
                }
            }
            return newMessages;
        }
        case 'CLEAR':
            return [];
        default:
            return state;
    }
}
export function useConsoleMessages() {
    const [consoleMessages, dispatch] = useReducer(consoleMessagesReducer, []);
    const messageQueueRef = useRef([]);
    const timeoutRef = useRef(null);
    const [, startTransition] = useTransition();
    const processQueue = useCallback(() => {
        if (messageQueueRef.current.length > 0) {
            const messagesToProcess = messageQueueRef.current;
            messageQueueRef.current = [];
            startTransition(() => {
                dispatch({ type: 'ADD_MESSAGES', payload: messagesToProcess });
            });
        }
        timeoutRef.current = null;
    }, []);
    const handleNewMessage = useCallback((message) => {
        messageQueueRef.current.push(message);
        if (!timeoutRef.current) {
            // Batch updates using a timeout. 16ms is a reasonable delay to batch
            // rapid-fire messages without noticeable lag.
            timeoutRef.current = setTimeout(processQueue, 16);
        }
    }, [processQueue]);
    useEffect(() => {
        const handleConsoleLog = (payload) => {
            handleNewMessage({
                type: payload.type,
                content: payload.content,
                count: 1,
            });
        };
        const handleOutput = (payload) => {
            const content = typeof payload.chunk === 'string'
                ? payload.chunk
                : new TextDecoder().decode(payload.chunk);
            // It would be nice if we could show stderr as 'warn' but unfortunately
            // we log non warning info to stderr before the app starts so that would
            // be misleading.
            handleNewMessage({ type: 'log', content, count: 1 });
        };
        coreEvents.on(CoreEvent.ConsoleLog, handleConsoleLog);
        coreEvents.on(CoreEvent.Output, handleOutput);
        return () => {
            coreEvents.off(CoreEvent.ConsoleLog, handleConsoleLog);
            coreEvents.off(CoreEvent.Output, handleOutput);
        };
    }, [handleNewMessage]);
    const clearConsoleMessages = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        messageQueueRef.current = [];
        startTransition(() => {
            dispatch({ type: 'CLEAR' });
        });
    }, []);
    // Cleanup on unmount
    useEffect(() => () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);
    return { consoleMessages, clearConsoleMessages };
}
//# sourceMappingURL=useConsoleMessages.js.map