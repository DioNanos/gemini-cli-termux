import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { AppEvent, appEvents } from './../../utils/events.js';
import { Box, Text } from 'ink';
import { MCPServerStatus } from '@google/gemini-cli-core';
import { GeminiSpinner } from './GeminiRespondingSpinner.js';
import { theme } from '../semantic-colors.js';
export const ConfigInitDisplay = () => {
    const [message, setMessage] = useState('Initializing...');
    useEffect(() => {
        const onChange = (clients) => {
            if (!clients || clients.size === 0) {
                setMessage(`Initializing...`);
                return;
            }
            let connected = 0;
            const connecting = [];
            for (const [name, client] of clients.entries()) {
                if (client.getStatus() === MCPServerStatus.CONNECTED) {
                    connected++;
                }
                else {
                    connecting.push(name);
                }
            }
            if (connecting.length > 0) {
                const maxDisplay = 3;
                const displayedServers = connecting.slice(0, maxDisplay).join(', ');
                const remaining = connecting.length - maxDisplay;
                const suffix = remaining > 0 ? `, +${remaining} more` : '';
                setMessage(`Connecting to MCP servers... (${connected}/${clients.size}) - Waiting for: ${displayedServers}${suffix}`);
            }
            else {
                setMessage(`Connecting to MCP servers... (${connected}/${clients.size})`);
            }
        };
        appEvents.on(AppEvent.McpClientUpdate, onChange);
        return () => {
            appEvents.off(AppEvent.McpClientUpdate, onChange);
        };
    }, []);
    return (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: [_jsx(GeminiSpinner, {}), " ", _jsx(Text, { color: theme.text.primary, children: message })] }) }));
};
//# sourceMappingURL=ConfigInitDisplay.js.map