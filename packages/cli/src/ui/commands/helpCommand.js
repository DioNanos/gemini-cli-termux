/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind } from './types.js';
import { MessageType } from '../types.js';
export const helpCommand = {
    name: 'help',
    altNames: ['?'],
    kind: CommandKind.BUILT_IN,
    description: 'For help on gemini-cli',
    autoExecute: true,
    action: async (context) => {
        const helpItem = {
            type: MessageType.HELP,
            timestamp: new Date(),
        };
        context.ui.addItem(helpItem);
    },
};
//# sourceMappingURL=helpCommand.js.map