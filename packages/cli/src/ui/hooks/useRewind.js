/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback } from 'react';
import { calculateTurnStats, calculateRewindImpact, } from '../utils/rewindFileOps.js';
export function useRewind(conversation) {
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [confirmationStats, setConfirmationStats] = useState(null);
    const getStats = useCallback((userMessage) => calculateTurnStats(conversation, userMessage), [conversation]);
    const selectMessage = useCallback((messageId) => {
        const msg = conversation.messages.find((m) => m.id === messageId);
        if (msg) {
            setSelectedMessageId(messageId);
            setConfirmationStats(calculateRewindImpact(conversation, msg));
        }
    }, [conversation]);
    const clearSelection = useCallback(() => {
        setSelectedMessageId(null);
        setConfirmationStats(null);
    }, []);
    return {
        selectedMessageId,
        getStats,
        confirmationStats,
        selectMessage,
        clearSelection,
    };
}
//# sourceMappingURL=useRewind.js.map