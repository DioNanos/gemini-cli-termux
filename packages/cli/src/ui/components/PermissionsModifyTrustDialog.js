import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import * as process from 'node:process';
import * as path from 'node:path';
import { TrustLevel } from '../../config/trustedFolders.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { usePermissionsModifyTrust } from '../hooks/usePermissionsModifyTrust.js';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { relaunchApp } from '../../utils/processUtils.js';
import {} from '../hooks/useHistoryManager.js';
export function PermissionsModifyTrustDialog({ onExit, addItem, targetDirectory, }) {
    const currentDirectory = targetDirectory ?? process.cwd();
    const dirName = path.basename(currentDirectory);
    const parentFolder = path.basename(path.dirname(currentDirectory));
    const TRUST_LEVEL_ITEMS = [
        {
            label: `Trust this folder (${dirName})`,
            value: TrustLevel.TRUST_FOLDER,
            key: TrustLevel.TRUST_FOLDER,
        },
        {
            label: `Trust parent folder (${parentFolder})`,
            value: TrustLevel.TRUST_PARENT,
            key: TrustLevel.TRUST_PARENT,
        },
        {
            label: "Don't trust",
            value: TrustLevel.DO_NOT_TRUST,
            key: TrustLevel.DO_NOT_TRUST,
        },
    ];
    const { cwd, currentTrustLevel, isInheritedTrustFromParent, isInheritedTrustFromIde, needsRestart, updateTrustLevel, commitTrustLevelChange, } = usePermissionsModifyTrust(onExit, addItem, currentDirectory);
    useKeypress((key) => {
        if (key.name === 'escape') {
            onExit();
        }
        if (needsRestart && key.name === 'r') {
            const success = commitTrustLevelChange();
            if (success) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                relaunchApp();
            }
            else {
                onExit();
            }
        }
    }, { isActive: true });
    const index = TRUST_LEVEL_ITEMS.findIndex((item) => item.value === currentTrustLevel);
    const initialIndex = index === -1 ? 0 : index;
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", padding: 1, children: [_jsxs(Box, { flexDirection: "column", paddingBottom: 1, children: [_jsxs(Text, { bold: true, children: ['> ', "Modify Trust Level"] }), _jsx(Box, { marginTop: 1 }), _jsxs(Text, { children: ["Folder: ", cwd] }), _jsxs(Text, { children: ["Current Level: ", _jsx(Text, { bold: true, children: currentTrustLevel || 'Not Set' })] }), isInheritedTrustFromParent && (_jsx(Text, { color: theme.text.secondary, children: "Note: This folder behaves as a trusted folder because one of the parent folders is trusted. It will remain trusted even if you set a different trust level here. To change this, you need to modify the trust setting in the parent folder." })), isInheritedTrustFromIde && (_jsx(Text, { color: theme.text.secondary, children: "Note: This folder behaves as a trusted folder because the connected IDE workspace is trusted. It will remain trusted even if you set a different trust level here." }))] }), _jsx(RadioButtonSelect, { items: TRUST_LEVEL_ITEMS, onSelect: updateTrustLevel, isFocused: true, initialIndex: initialIndex }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.secondary, children: "(Use Enter to select, Esc to close)" }) })] }), needsRestart && (_jsx(Box, { marginLeft: 1, marginTop: 1, children: _jsx(Text, { color: theme.status.warning, children: "To apply the trust changes, Gemini CLI must be restarted. Press 'r' to restart CLI now." }) }))] }));
}
//# sourceMappingURL=PermissionsModifyTrustDialog.js.map