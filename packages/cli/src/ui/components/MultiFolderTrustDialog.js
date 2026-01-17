import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { useState } from 'react';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { loadTrustedFolders, TrustLevel } from '../../config/trustedFolders.js';
import { expandHomeDir } from '../utils/directoryUtils.js';
import { MessageType } from '../types.js';
export var MultiFolderTrustChoice;
(function (MultiFolderTrustChoice) {
    MultiFolderTrustChoice[MultiFolderTrustChoice["YES"] = 0] = "YES";
    MultiFolderTrustChoice[MultiFolderTrustChoice["YES_AND_REMEMBER"] = 1] = "YES_AND_REMEMBER";
    MultiFolderTrustChoice[MultiFolderTrustChoice["NO"] = 2] = "NO";
})(MultiFolderTrustChoice || (MultiFolderTrustChoice = {}));
export const MultiFolderTrustDialog = ({ folders, onComplete, trustedDirs, errors: initialErrors, finishAddingDirectories, config, addItem, }) => {
    const [submitted, setSubmitted] = useState(false);
    const handleCancel = async () => {
        setSubmitted(true);
        const errors = [...initialErrors];
        errors.push(`Operation cancelled. The following directories were not added:\n- ${folders.join('\n- ')}`);
        await finishAddingDirectories(config, addItem, trustedDirs, errors);
        onComplete();
    };
    useKeypress((key) => {
        if (key.name === 'escape') {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleCancel();
        }
    }, { isActive: !submitted });
    const options = [
        {
            label: 'Yes',
            value: MultiFolderTrustChoice.YES,
            key: 'yes',
        },
        {
            label: 'Yes, and remember the directories as trusted',
            value: MultiFolderTrustChoice.YES_AND_REMEMBER,
            key: 'yes-and-remember',
        },
        {
            label: 'No',
            value: MultiFolderTrustChoice.NO,
            key: 'no',
        },
    ];
    const handleSelect = async (choice) => {
        setSubmitted(true);
        if (!config) {
            addItem({
                type: MessageType.ERROR,
                text: 'Configuration is not available.',
            });
            onComplete();
            return;
        }
        const workspaceContext = config.getWorkspaceContext();
        const trustedFolders = loadTrustedFolders();
        const errors = [...initialErrors];
        const added = [...trustedDirs];
        if (choice === MultiFolderTrustChoice.NO) {
            errors.push(`The following directories were not added because they were not trusted:\n- ${folders.join('\n- ')}`);
        }
        else {
            for (const dir of folders) {
                try {
                    const expandedPath = expandHomeDir(dir);
                    if (choice === MultiFolderTrustChoice.YES_AND_REMEMBER) {
                        trustedFolders.setValue(expandedPath, TrustLevel.TRUST_FOLDER);
                    }
                    workspaceContext.addDirectory(expandedPath);
                    added.push(dir);
                }
                catch (e) {
                    const error = e;
                    errors.push(`Error adding '${dir}': ${error.message}`);
                }
            }
        }
        await finishAddingDirectories(config, addItem, added, errors);
        onComplete();
    };
    return (_jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.status.warning, padding: 1, marginLeft: 1, marginRight: 1, children: [_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Do you trust the following folders being added to this workspace?" }), _jsx(Text, { color: theme.text.secondary, children: folders.map((f) => `- ${f}`).join('\n') }), _jsx(Text, { color: theme.text.primary, children: "Trusting a folder allows Gemini to read and perform auto-edits when in auto-approval mode. This is a security feature to prevent accidental execution in untrusted directories." })] }), _jsx(RadioButtonSelect, { items: options, onSelect: handleSelect, isFocused: !submitted })] }), submitted && (_jsx(Box, { marginLeft: 1, marginTop: 1, children: _jsx(Text, { color: theme.text.primary, children: "Applying trust settings..." }) }))] }));
};
//# sourceMappingURL=MultiFolderTrustDialog.js.map