/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind } from './types.js';
export const resumeCommand = {
    name: 'resume',
    description: 'Browse and resume auto-saved conversations',
    kind: CommandKind.BUILT_IN,
    autoExecute: true,
    action: async (_context, _args) => ({
        type: 'dialog',
        dialog: 'sessionBrowser',
    }),
};
//# sourceMappingURL=resumeCommand.js.map