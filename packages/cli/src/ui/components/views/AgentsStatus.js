import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
import { MarkdownDisplay } from '../../utils/MarkdownDisplay.js';
export const AgentsStatus = ({ agents, terminalWidth, }) => {
    const localAgents = agents.filter((a) => a.kind === 'local');
    const remoteAgents = agents.filter((a) => a.kind === 'remote');
    if (agents.length === 0) {
        return (_jsx(Box, { flexDirection: "column", marginBottom: 1, children: _jsx(Text, { children: "No agents available." }) }));
    }
    const renderAgentList = (title, agentList) => {
        if (agentList.length === 0)
            return null;
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: theme.text.primary, children: title }), _jsx(Box, { height: 1 }), agentList.map((agent) => (_jsxs(Box, { flexDirection: "row", children: [_jsxs(Text, { color: theme.text.primary, children: ['  ', "- "] }), _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { bold: true, color: theme.text.accent, children: [agent.displayName || agent.name, agent.displayName && agent.displayName !== agent.name && (_jsxs(Text, { bold: false, children: [" (", agent.name, ")"] }))] }), agent.description && (_jsx(MarkdownDisplay, { terminalWidth: terminalWidth, text: agent.description, isPending: false }))] })] }, agent.name)))] }));
    };
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [renderAgentList('Local Agents', localAgents), localAgents.length > 0 && remoteAgents.length > 0 && _jsx(Box, { height: 1 }), renderAgentList('Remote Agents', remoteAgents)] }));
};
//# sourceMappingURL=AgentsStatus.js.map