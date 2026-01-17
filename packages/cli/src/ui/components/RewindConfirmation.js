import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { useMemo } from 'react';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { formatTimeAgo } from '../utils/formatters.js';
import { keyMatchers, Command } from '../keyMatchers.js';
export var RewindOutcome;
(function (RewindOutcome) {
    RewindOutcome["RewindAndRevert"] = "rewind_and_revert";
    RewindOutcome["RewindOnly"] = "rewind_only";
    RewindOutcome["RevertOnly"] = "revert_only";
    RewindOutcome["Cancel"] = "cancel";
})(RewindOutcome || (RewindOutcome = {}));
const REWIND_OPTIONS = [
    {
        label: 'Rewind conversation and revert code changes',
        value: RewindOutcome.RewindAndRevert,
        key: 'Rewind conversation and revert code changes',
    },
    {
        label: 'Rewind conversation',
        value: RewindOutcome.RewindOnly,
        key: 'Rewind conversation',
    },
    {
        label: 'Revert code changes',
        value: RewindOutcome.RevertOnly,
        key: 'Revert code changes',
    },
    {
        label: 'Do nothing (esc)',
        value: RewindOutcome.Cancel,
        key: 'Do nothing (esc)',
    },
];
export const RewindConfirmation = ({ stats, onConfirm, terminalWidth, timestamp, }) => {
    useKeypress((key) => {
        if (keyMatchers[Command.ESCAPE](key)) {
            onConfirm(RewindOutcome.Cancel);
        }
    }, { isActive: true });
    const handleSelect = (outcome) => {
        onConfirm(outcome);
    };
    const options = useMemo(() => {
        if (stats) {
            return REWIND_OPTIONS;
        }
        return REWIND_OPTIONS.filter((option) => option.value !== RewindOutcome.RewindAndRevert &&
            option.value !== RewindOutcome.RevertOnly);
    }, [stats]);
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.border.default, padding: 1, width: terminalWidth, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: "Confirm Rewind" }) }), stats && (_jsxs(Box, { flexDirection: "column", marginBottom: 1, borderStyle: "single", borderColor: theme.border.default, paddingX: 1, children: [_jsx(Text, { color: theme.text.primary, children: stats.fileCount === 1
                            ? `File: ${stats.details?.at(0)?.fileName}`
                            : `${stats.fileCount} files affected` }), _jsxs(Box, { flexDirection: "row", children: [_jsxs(Text, { color: theme.status.success, children: ["Lines added: ", stats.addedLines, ' '] }), _jsxs(Text, { color: theme.status.error, children: ["Lines removed: ", stats.removedLines] }), timestamp && (_jsxs(Text, { color: theme.text.secondary, children: [' ', "(", formatTimeAgo(timestamp), ")"] }))] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.status.warning, children: "\u2139 Rewinding does not affect files edited manually or by the shell tool." }) })] })), !stats && (_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { color: theme.text.secondary, children: "No code changes to revert." }), timestamp && (_jsxs(Text, { color: theme.text.secondary, children: [' ', "(", formatTimeAgo(timestamp), ")"] }))] })), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Select an action:" }) }), _jsx(RadioButtonSelect, { items: options, onSelect: handleSelect, isFocused: true })] }));
};
//# sourceMappingURL=RewindConfirmation.js.map