/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { isDevelopment } from '../../utils/installationInfo.js';
import { CommandKind } from './types.js';
export const profileCommand = isDevelopment
    ? {
        name: 'profile',
        kind: CommandKind.BUILT_IN,
        description: 'Toggle the debug profile display',
        autoExecute: true,
        action: async (context) => {
            context.ui.toggleDebugProfiler();
            return {
                type: 'message',
                messageType: 'info',
                content: 'Toggled profile display.',
            };
        },
    }
    : null;
//# sourceMappingURL=profileCommand.js.map