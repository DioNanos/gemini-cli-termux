import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { useKeypress } from '../hooks/useKeypress.js';
export var LogoutChoice;
(function (LogoutChoice) {
    LogoutChoice["LOGIN"] = "login";
    LogoutChoice["EXIT"] = "exit";
})(LogoutChoice || (LogoutChoice = {}));
export const LogoutConfirmationDialog = ({ onSelect }) => {
    // Handle escape key to exit (consistent with other dialogs)
    useKeypress((key) => {
        if (key.name === 'escape') {
            onSelect(LogoutChoice.EXIT);
        }
    }, { isActive: true });
    const options = [
        {
            label: 'Login',
            value: LogoutChoice.LOGIN,
            key: 'login',
        },
        {
            label: 'Exit',
            value: LogoutChoice.EXIT,
            key: 'exit',
        },
    ];
    return (_jsx(Box, { flexDirection: "row", width: "100%", children: _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.border.focused, padding: 1, flexGrow: 1, marginLeft: 1, marginRight: 1, children: [_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "You are now logged out." }), _jsx(Text, { color: theme.text.secondary, children: "Login again to continue using Gemini CLI, or exit the application." })] }), _jsx(RadioButtonSelect, { items: options, onSelect: onSelect, isFocused: true }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.secondary, children: "(Use Enter to select, Esc to close)" }) })] }) }));
};
//# sourceMappingURL=LogoutConfirmationDialog.js.map