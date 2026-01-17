import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { editorSettingsManager, } from '../editors/editorSettingsManager.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { SettingScope } from '../../config/settings.js';
import { isEditorAvailable, EDITOR_DISPLAY_NAMES, } from '@google/gemini-cli-core';
import { useKeypress } from '../hooks/useKeypress.js';
import { coreEvents } from '@google/gemini-cli-core';
export function EditorSettingsDialog({ onSelect, settings, onExit, }) {
    const [selectedScope, setSelectedScope] = useState(SettingScope.User);
    const [focusedSection, setFocusedSection] = useState('editor');
    useKeypress((key) => {
        if (key.name === 'tab') {
            setFocusedSection((prev) => (prev === 'editor' ? 'scope' : 'editor'));
        }
        if (key.name === 'escape') {
            onExit();
        }
    }, { isActive: true });
    const editorItems = editorSettingsManager.getAvailableEditorDisplays();
    const currentPreference = settings.forScope(selectedScope).settings.general?.preferredEditor;
    let editorIndex = currentPreference
        ? editorItems.findIndex((item) => item.type === currentPreference)
        : 0;
    if (editorIndex === -1) {
        coreEvents.emitFeedback('error', `Editor is not supported: ${currentPreference}`);
        editorIndex = 0;
    }
    const scopeItems = [
        {
            label: 'User Settings',
            value: SettingScope.User,
            key: SettingScope.User,
        },
        {
            label: 'Workspace Settings',
            value: SettingScope.Workspace,
            key: SettingScope.Workspace,
        },
    ];
    const handleEditorSelect = (editorType) => {
        if (editorType === 'not_set') {
            onSelect(undefined, selectedScope);
            return;
        }
        onSelect(editorType, selectedScope);
    };
    const handleScopeSelect = (scope) => {
        setSelectedScope(scope);
        setFocusedSection('editor');
    };
    let otherScopeModifiedMessage = '';
    const otherScope = selectedScope === SettingScope.User
        ? SettingScope.Workspace
        : SettingScope.User;
    if (settings.forScope(otherScope).settings.general?.preferredEditor !==
        undefined) {
        otherScopeModifiedMessage =
            settings.forScope(selectedScope).settings.general?.preferredEditor !==
                undefined
                ? `(Also modified in ${otherScope})`
                : `(Modified in ${otherScope})`;
    }
    let mergedEditorName = 'None';
    if (settings.merged.general.preferredEditor &&
        isEditorAvailable(settings.merged.general.preferredEditor)) {
        mergedEditorName =
            EDITOR_DISPLAY_NAMES[settings.merged.general.preferredEditor];
    }
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "row", padding: 1, width: "100%", children: [_jsxs(Box, { flexDirection: "column", width: "45%", paddingRight: 2, children: [_jsxs(Text, { bold: focusedSection === 'editor', children: [focusedSection === 'editor' ? '> ' : '  ', "Select Editor", ' ', _jsx(Text, { color: theme.text.secondary, children: otherScopeModifiedMessage })] }), _jsx(RadioButtonSelect, { items: editorItems.map((item) => ({
                            label: item.name,
                            value: item.type,
                            disabled: item.disabled,
                            key: item.type,
                        })), initialIndex: editorIndex, onSelect: handleEditorSelect, isFocused: focusedSection === 'editor' }, selectedScope), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { bold: focusedSection === 'scope', children: [focusedSection === 'scope' ? '> ' : '  ', "Apply To"] }), _jsx(RadioButtonSelect, { items: scopeItems, initialIndex: 0, onSelect: handleScopeSelect, isFocused: focusedSection === 'scope' })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.secondary, children: "(Use Enter to select, Tab to change focus, Esc to close)" }) })] }), _jsxs(Box, { flexDirection: "column", width: "55%", paddingLeft: 2, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Editor Preference" }), _jsxs(Box, { flexDirection: "column", gap: 1, marginTop: 1, children: [_jsx(Text, { color: theme.text.secondary, children: "These editors are currently supported. Please note that some editors cannot be used in sandbox mode." }), _jsxs(Text, { color: theme.text.secondary, children: ["Your preferred editor is:", ' ', _jsx(Text, { color: mergedEditorName === 'None'
                                            ? theme.status.error
                                            : theme.text.link, bold: true, children: mergedEditorName }), "."] })] })] })] }));
}
//# sourceMappingURL=EditorSettingsDialog.js.map