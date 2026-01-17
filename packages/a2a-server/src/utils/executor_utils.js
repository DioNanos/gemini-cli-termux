/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { v4 as uuidv4 } from 'uuid';
import { CoderAgentEvent } from '../types.js';
export async function pushTaskStateFailed(error, eventBus, taskId, contextId) {
    const errorMessage = error instanceof Error ? error.message : 'Agent execution error';
    const stateChange = {
        kind: CoderAgentEvent.StateChangeEvent,
    };
    eventBus.publish({
        kind: 'status-update',
        taskId,
        contextId,
        status: {
            state: 'failed',
            message: {
                kind: 'message',
                role: 'agent',
                parts: [
                    {
                        kind: 'text',
                        text: errorMessage,
                    },
                ],
                messageId: uuidv4(),
                taskId,
                contextId,
            },
        },
        final: true,
        metadata: {
            coderAgent: stateChange,
            model: 'unknown',
            error: errorMessage,
        },
    });
}
//# sourceMappingURL=executor_utils.js.map