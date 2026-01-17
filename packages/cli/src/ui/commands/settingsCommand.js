/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind } from './types.js';
export const settingsCommand = {
    name: 'settings',
    description: 'View and edit Gemini CLI settings',
    kind: CommandKind.BUILT_IN,
    autoExecute: true,
    action: (_context, _args) => ({
        type: 'dialog',
        dialog: 'settings',
    }),
};
//# sourceMappingURL=settingsCommand.js.map