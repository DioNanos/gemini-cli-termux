/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { on } from 'node:events';
import { MessageBusType, } from '../confirmation-bus/types.js';
import { ToolConfirmationOutcome, } from '../tools/tools.js';
/**
 * Waits for a confirmation response with the matching correlationId.
 *
 * NOTE: It is the caller's responsibility to manage the lifecycle of this wait
 * via the provided AbortSignal. To prevent memory leaks and "zombie" listeners
 * in the event of a lost connection (e.g. IDE crash), it is strongly recommended
 * to use a signal with a timeout (e.g. AbortSignal.timeout(ms)).
 *
 * @param messageBus The MessageBus to listen on.
 * @param correlationId The correlationId to match.
 * @param signal An AbortSignal to cancel the wait and cleanup listeners.
 */
export async function awaitConfirmation(messageBus, correlationId, signal) {
    if (signal.aborted) {
        throw new Error('Operation cancelled');
    }
    try {
        for await (const [msg] of on(messageBus, MessageBusType.TOOL_CONFIRMATION_RESPONSE, { signal })) {
            const response = msg;
            if (response.correlationId === correlationId) {
                return {
                    outcome: response.outcome ??
                        // TODO: Remove legacy confirmed boolean fallback once migration complete
                        (response.confirmed
                            ? ToolConfirmationOutcome.ProceedOnce
                            : ToolConfirmationOutcome.Cancel),
                    payload: response.payload,
                };
            }
        }
    }
    catch (error) {
        if (signal.aborted || error.name === 'AbortError') {
            throw new Error('Operation cancelled');
        }
        throw error;
    }
    // This point should only be reached if the iterator closes without resolving,
    // which generally means the signal was aborted.
    throw new Error('Operation cancelled');
}
//# sourceMappingURL=confirmation.js.map