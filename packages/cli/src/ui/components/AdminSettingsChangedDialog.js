import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { useUIActions } from '../contexts/UIActionsContext.js';
import { Command, keyMatchers } from '../keyMatchers.js';
export const AdminSettingsChangedDialog = () => {
    const { handleRestart } = useUIActions();
    useKeypress((key) => {
        if (keyMatchers[Command.RESTART_APP](key)) {
            handleRestart();
        }
    }, { isActive: true });
    const message = 'Admin settings have changed. Please restart the session to apply new settings.';
    return (_jsx(Box, { borderStyle: "round", borderColor: theme.status.warning, paddingX: 1, children: _jsxs(Text, { color: theme.status.warning, children: [message, " Press 'r' to restart, or 'Ctrl+C' twice to exit."] }) }));
};
//# sourceMappingURL=AdminSettingsChangedDialog.js.map