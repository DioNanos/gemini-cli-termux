/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MessageType } from '../types.js';
import { formatDuration } from '../utils/formatters.js';
import { CommandKind, } from './types.js';
async function defaultSessionView(context) {
    const now = new Date();
    const { sessionStartTime } = context.session.stats;
    if (!sessionStartTime) {
        context.ui.addItem({
            type: MessageType.ERROR,
            text: 'Session start time is unavailable, cannot calculate stats.',
        });
        return;
    }
    const wallDuration = now.getTime() - sessionStartTime.getTime();
    const statsItem = {
        type: MessageType.STATS,
        duration: formatDuration(wallDuration),
    };
    if (context.services.config) {
        const quota = await context.services.config.refreshUserQuota();
        if (quota) {
            statsItem.quotas = quota;
        }
    }
    context.ui.addItem(statsItem);
}
export const statsCommand = {
    name: 'stats',
    altNames: ['usage'],
    description: 'Check session stats. Usage: /stats [session|model|tools]',
    kind: CommandKind.BUILT_IN,
    autoExecute: false,
    action: async (context) => {
        await defaultSessionView(context);
    },
    subCommands: [
        {
            name: 'session',
            description: 'Show session-specific usage statistics',
            kind: CommandKind.BUILT_IN,
            autoExecute: true,
            action: async (context) => {
                await defaultSessionView(context);
            },
        },
        {
            name: 'model',
            description: 'Show model-specific usage statistics',
            kind: CommandKind.BUILT_IN,
            autoExecute: true,
            action: (context) => {
                context.ui.addItem({
                    type: MessageType.MODEL_STATS,
                });
            },
        },
        {
            name: 'tools',
            description: 'Show tool-specific usage statistics',
            kind: CommandKind.BUILT_IN,
            autoExecute: true,
            action: (context) => {
                context.ui.addItem({
                    type: MessageType.TOOL_STATS,
                });
            },
        },
    ],
};
//# sourceMappingURL=statsCommand.js.map