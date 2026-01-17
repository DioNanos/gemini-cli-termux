/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreToolScheduler, } from './coreToolScheduler.js';
/**
 * Executes a single tool call non-interactively by leveraging the CoreToolScheduler.
 */
export async function executeToolCall(config, toolCallRequest, abortSignal) {
    return new Promise((resolve, reject) => {
        const scheduler = new CoreToolScheduler({
            config,
            getPreferredEditor: () => undefined,
            onAllToolCallsComplete: async (completedToolCalls) => {
                if (completedToolCalls.length > 0) {
                    resolve(completedToolCalls[0]);
                }
                else {
                    reject(new Error('No completed tool calls returned.'));
                }
            },
        });
        scheduler.schedule(toolCallRequest, abortSignal).catch((error) => {
            reject(error);
        });
    });
}
//# sourceMappingURL=nonInteractiveToolExecutor.js.map