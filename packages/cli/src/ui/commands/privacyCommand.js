/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind } from './types.js';
export const privacyCommand = {
    name: 'privacy',
    description: 'Display the privacy notice',
    kind: CommandKind.BUILT_IN,
    autoExecute: true,
    action: () => ({
        type: 'dialog',
        dialog: 'privacy',
    }),
};
//# sourceMappingURL=privacyCommand.js.map