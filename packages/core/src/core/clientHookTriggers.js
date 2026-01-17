/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MessageBusType, } from '../confirmation-bus/types.js';
import { createHookOutput } from '../hooks/types.js';
import { partToString } from '../utils/partUtils.js';
import { debugLogger } from '../utils/debugLogger.js';
/**
 * Fires the BeforeAgent hook and returns the hook output.
 * This should be called before processing a user prompt.
 *
 * The caller can use the returned DefaultHookOutput methods:
 * - isBlockingDecision() / shouldStopExecution() to check if blocked
 * - getEffectiveReason() to get the blocking reason
 * - getAdditionalContext() to get additional context to add
 *
 * @param messageBus The message bus to use for hook communication
 * @param request The user's request (prompt)
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export async function fireBeforeAgentHook(messageBus, request) {
    try {
        const promptText = partToString(request);
        const response = await messageBus.request({
            type: MessageBusType.HOOK_EXECUTION_REQUEST,
            eventName: 'BeforeAgent',
            input: {
                prompt: promptText,
            },
        }, MessageBusType.HOOK_EXECUTION_RESPONSE);
        return response.output
            ? createHookOutput('BeforeAgent', response.output)
            : undefined;
    }
    catch (error) {
        debugLogger.debug(`BeforeAgent hook failed: ${error}`);
        return undefined;
    }
}
/**
 * Fires the AfterAgent hook and returns the hook output.
 * This should be called after the agent has generated a response.
 *
 * The caller can use the returned DefaultHookOutput methods:
 * - isBlockingDecision() / shouldStopExecution() to check if continuation is requested
 * - getEffectiveReason() to get the continuation reason
 *
 * @param messageBus The message bus to use for hook communication
 * @param request The original user's request (prompt)
 * @param responseText The agent's response text
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export async function fireAfterAgentHook(messageBus, request, responseText) {
    try {
        const promptText = partToString(request);
        const response = await messageBus.request({
            type: MessageBusType.HOOK_EXECUTION_REQUEST,
            eventName: 'AfterAgent',
            input: {
                prompt: promptText,
                prompt_response: responseText,
                stop_hook_active: false,
            },
        }, MessageBusType.HOOK_EXECUTION_RESPONSE);
        return response.output
            ? createHookOutput('AfterAgent', response.output)
            : undefined;
    }
    catch (error) {
        debugLogger.debug(`AfterAgent hook failed: ${error}`);
        return undefined;
    }
}
//# sourceMappingURL=clientHookTriggers.js.map