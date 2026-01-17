import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
const MAX_DISPLAYED_QUEUED_MESSAGES = 3;
export const QueuedMessageDisplay = ({ messageQueue, }) => {
    if (messageQueue.length === 0) {
        return null;
    }
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Box, { paddingLeft: 2, children: _jsx(Text, { dimColor: true, children: "Queued (press \u2191 to edit):" }) }), messageQueue
                .slice(0, MAX_DISPLAYED_QUEUED_MESSAGES)
                .map((message, index) => {
                const preview = message.replace(/\s+/g, ' ');
                return (_jsx(Box, { paddingLeft: 4, width: "100%", children: _jsx(Text, { dimColor: true, wrap: "truncate", children: preview }) }, index));
            }), messageQueue.length > MAX_DISPLAYED_QUEUED_MESSAGES && (_jsx(Box, { paddingLeft: 4, children: _jsxs(Text, { dimColor: true, children: ["... (+", messageQueue.length - MAX_DISPLAYED_QUEUED_MESSAGES, " more)"] }) }))] }));
};
//# sourceMappingURL=QueuedMessageDisplay.js.map