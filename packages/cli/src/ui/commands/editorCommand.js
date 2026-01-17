/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind, } from './types.js';
export const editorCommand = {
    name: 'editor',
    description: 'Set external editor preference',
    kind: CommandKind.BUILT_IN,
    autoExecute: true,
    action: () => ({
        type: 'dialog',
        dialog: 'editor',
    }),
};
//# sourceMappingURL=editorCommand.js.map