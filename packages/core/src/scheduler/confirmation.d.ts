/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { ToolConfirmationOutcome, type ToolConfirmationPayload } from '../tools/tools.js';
export interface ConfirmationResult {
    outcome: ToolConfirmationOutcome;
    payload?: ToolConfirmationPayload;
}
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
export declare function awaitConfirmation(messageBus: MessageBus, correlationId: string, signal: AbortSignal): Promise<ConfirmationResult>;
