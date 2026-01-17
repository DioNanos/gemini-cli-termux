import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Box, Text } from 'ink';
import { ToolCallStatus } from '../../types.js';
import { GeminiRespondingSpinner } from '../GeminiRespondingSpinner.js';
import { SHELL_COMMAND_NAME, SHELL_NAME, TOOL_STATUS, } from '../../constants.js';
import { theme } from '../../semantic-colors.js';
import { SHELL_TOOL_NAME } from '@google/gemini-cli-core';
export const STATUS_INDICATOR_WIDTH = 3;
export const ToolStatusIndicator = ({ status, name, }) => {
    const isShell = name === SHELL_COMMAND_NAME ||
        name === SHELL_NAME ||
        name === SHELL_TOOL_NAME;
    const statusColor = isShell ? theme.ui.symbol : theme.status.warning;
    return (_jsxs(Box, { minWidth: STATUS_INDICATOR_WIDTH, children: [status === ToolCallStatus.Pending && (_jsx(Text, { color: theme.status.success, children: TOOL_STATUS.PENDING })), status === ToolCallStatus.Executing && (_jsx(GeminiRespondingSpinner, { spinnerType: "toggle", nonRespondingDisplay: TOOL_STATUS.EXECUTING })), status === ToolCallStatus.Success && (_jsx(Text, { color: theme.status.success, "aria-label": 'Success:', children: TOOL_STATUS.SUCCESS })), status === ToolCallStatus.Confirming && (_jsx(Text, { color: statusColor, "aria-label": 'Confirming:', children: TOOL_STATUS.CONFIRMING })), status === ToolCallStatus.Canceled && (_jsx(Text, { color: statusColor, "aria-label": 'Canceled:', bold: true, children: TOOL_STATUS.CANCELED })), status === ToolCallStatus.Error && (_jsx(Text, { color: theme.status.error, "aria-label": 'Error:', bold: true, children: TOOL_STATUS.ERROR }))] }));
};
export const ToolInfo = ({ name, description, status, emphasis, }) => {
    const nameColor = React.useMemo(() => {
        switch (emphasis) {
            case 'high':
                return theme.text.primary;
            case 'medium':
                return theme.text.primary;
            case 'low':
                return theme.text.secondary;
            default: {
                const exhaustiveCheck = emphasis;
                return exhaustiveCheck;
            }
        }
    }, [emphasis]);
    return (_jsx(Box, { overflow: "hidden", height: 1, flexGrow: 1, flexShrink: 1, children: _jsxs(Text, { strikethrough: status === ToolCallStatus.Canceled, wrap: "truncate", children: [_jsx(Text, { color: nameColor, bold: true, children: name }), ' ', _jsx(Text, { color: theme.text.secondary, children: description })] }) }));
};
export const TrailingIndicator = () => (_jsxs(Text, { color: theme.text.primary, wrap: "truncate", children: [' ', "\u2190"] }));
//# sourceMappingURL=ToolShared.js.map