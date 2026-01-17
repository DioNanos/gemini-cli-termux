/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind } from './types.js';
export const themeCommand = {
    name: 'theme',
    description: 'Change the theme',
    kind: CommandKind.BUILT_IN,
    autoExecute: true,
    action: (_context, _args) => ({
        type: 'dialog',
        dialog: 'theme',
    }),
};
//# sourceMappingURL=themeCommand.js.map