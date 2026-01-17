import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { runExitCleanup } from '../../utils/cleanup.js';
import { RELAUNCH_EXIT_CODE } from '../../utils/processUtils.js';
export const LoginWithGoogleRestartDialog = ({ onDismiss, }) => {
    useKeypress((key) => {
        if (key.name === 'escape') {
            onDismiss();
        }
        else if (key.name === 'r' || key.name === 'R') {
            setTimeout(async () => {
                await runExitCleanup();
                process.exit(RELAUNCH_EXIT_CODE);
            }, 100);
        }
    }, { isActive: true });
    const message = 'You have successfully logged in with Google. Gemini CLI needs to be restarted.';
    return (_jsx(Box, { borderStyle: "round", borderColor: theme.status.warning, paddingX: 1, children: _jsxs(Text, { color: theme.status.warning, children: [message, " Press 'r' to restart, or 'escape' to choose a different auth method."] }) }));
};
//# sourceMappingURL=LoginWithGoogleRestartDialog.js.map