import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { useEffect, useState, useCallback } from 'react';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { useKeypress } from '../hooks/useKeypress.js';
import * as process from 'node:process';
import * as path from 'node:path';
import { relaunchApp } from '../../utils/processUtils.js';
import { runExitCleanup } from '../../utils/cleanup.js';
import { ExitCodes } from '@google/gemini-cli-core';
export var FolderTrustChoice;
(function (FolderTrustChoice) {
    FolderTrustChoice["TRUST_FOLDER"] = "trust_folder";
    FolderTrustChoice["TRUST_PARENT"] = "trust_parent";
    FolderTrustChoice["DO_NOT_TRUST"] = "do_not_trust";
})(FolderTrustChoice || (FolderTrustChoice = {}));
export const FolderTrustDialog = ({ onSelect, isRestarting, }) => {
    const [exiting, setExiting] = useState(false);
    useEffect(() => {
        let timer;
        if (isRestarting) {
            timer = setTimeout(async () => {
                await relaunchApp();
            }, 250);
        }
        return () => {
            if (timer)
                clearTimeout(timer);
        };
    }, [isRestarting]);
    const handleExit = useCallback(() => {
        setExiting(true);
        // Give time for the UI to render the exiting message
        setTimeout(async () => {
            await runExitCleanup();
            process.exit(ExitCodes.FATAL_CANCELLATION_ERROR);
        }, 100);
    }, []);
    useKeypress((key) => {
        if (key.name === 'escape') {
            handleExit();
        }
    }, { isActive: !isRestarting });
    const dirName = path.basename(process.cwd());
    const parentFolder = path.basename(path.dirname(process.cwd()));
    const options = [
        {
            label: `Trust folder (${dirName})`,
            value: FolderTrustChoice.TRUST_FOLDER,
            key: `Trust folder (${dirName})`,
        },
        {
            label: `Trust parent folder (${parentFolder})`,
            value: FolderTrustChoice.TRUST_PARENT,
            key: `Trust parent folder (${parentFolder})`,
        },
        {
            label: "Don't trust",
            value: FolderTrustChoice.DO_NOT_TRUST,
            key: "Don't trust",
        },
    ];
    return (_jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.status.warning, padding: 1, marginLeft: 1, marginRight: 1, children: [_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Do you trust this folder?" }), _jsx(Text, { color: theme.text.primary, children: "Trusting a folder allows Gemini to execute commands it suggests. This is a security feature to prevent accidental execution in untrusted directories." })] }), _jsx(RadioButtonSelect, { items: options, onSelect: onSelect, isFocused: !isRestarting })] }), isRestarting && (_jsx(Box, { marginLeft: 1, marginTop: 1, children: _jsx(Text, { color: theme.status.warning, children: "Gemini CLI is restarting to apply the trust changes..." }) })), exiting && (_jsx(Box, { marginLeft: 1, marginTop: 1, children: _jsx(Text, { color: theme.status.warning, children: "A folder trust level must be selected to continue. Exiting since escape was pressed." }) }))] }));
};
//# sourceMappingURL=FolderTrustDialog.js.map