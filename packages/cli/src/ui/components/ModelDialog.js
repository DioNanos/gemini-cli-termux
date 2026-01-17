import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useContext, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { PREVIEW_GEMINI_MODEL, PREVIEW_GEMINI_FLASH_MODEL, PREVIEW_GEMINI_MODEL_AUTO, DEFAULT_GEMINI_MODEL, DEFAULT_GEMINI_FLASH_MODEL, DEFAULT_GEMINI_FLASH_LITE_MODEL, DEFAULT_GEMINI_MODEL_AUTO, ModelSlashCommandEvent, logModelSlashCommand, getDisplayString, } from '@google/gemini-cli-core';
import { useKeypress } from '../hooks/useKeypress.js';
import { theme } from '../semantic-colors.js';
import { DescriptiveRadioButtonSelect } from './shared/DescriptiveRadioButtonSelect.js';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { ThemedGradient } from './ThemedGradient.js';
export function ModelDialog({ onClose }) {
    const config = useContext(ConfigContext);
    const [view, setView] = useState('main');
    const [persistMode, setPersistMode] = useState(false);
    // Determine the Preferred Model (read once when the dialog opens).
    const preferredModel = config?.getModel() || DEFAULT_GEMINI_MODEL_AUTO;
    const shouldShowPreviewModels = config?.getPreviewFeatures() && config.getHasAccessToPreviewModel();
    const manualModelSelected = useMemo(() => {
        const manualModels = [
            DEFAULT_GEMINI_MODEL,
            DEFAULT_GEMINI_FLASH_MODEL,
            DEFAULT_GEMINI_FLASH_LITE_MODEL,
            PREVIEW_GEMINI_MODEL,
            PREVIEW_GEMINI_FLASH_MODEL,
        ];
        if (manualModels.includes(preferredModel)) {
            return preferredModel;
        }
        return '';
    }, [preferredModel]);
    useKeypress((key) => {
        if (key.name === 'escape') {
            if (view === 'manual') {
                setView('main');
            }
            else {
                onClose();
            }
        }
        if (key.name === 'tab') {
            setPersistMode((prev) => !prev);
        }
    }, { isActive: true });
    const mainOptions = useMemo(() => {
        const list = [
            {
                value: DEFAULT_GEMINI_MODEL_AUTO,
                title: getDisplayString(DEFAULT_GEMINI_MODEL_AUTO),
                description: 'Let Gemini CLI decide the best model for the task: gemini-2.5-pro, gemini-2.5-flash',
                key: DEFAULT_GEMINI_MODEL_AUTO,
            },
            {
                value: 'Manual',
                title: manualModelSelected
                    ? `Manual (${manualModelSelected})`
                    : 'Manual',
                description: 'Manually select a model',
                key: 'Manual',
            },
        ];
        if (shouldShowPreviewModels) {
            list.unshift({
                value: PREVIEW_GEMINI_MODEL_AUTO,
                title: getDisplayString(PREVIEW_GEMINI_MODEL_AUTO),
                description: 'Let Gemini CLI decide the best model for the task: gemini-3-pro, gemini-3-flash',
                key: PREVIEW_GEMINI_MODEL_AUTO,
            });
        }
        return list;
    }, [shouldShowPreviewModels, manualModelSelected]);
    const manualOptions = useMemo(() => {
        const list = [
            {
                value: DEFAULT_GEMINI_MODEL,
                title: DEFAULT_GEMINI_MODEL,
                key: DEFAULT_GEMINI_MODEL,
            },
            {
                value: DEFAULT_GEMINI_FLASH_MODEL,
                title: DEFAULT_GEMINI_FLASH_MODEL,
                key: DEFAULT_GEMINI_FLASH_MODEL,
            },
            {
                value: DEFAULT_GEMINI_FLASH_LITE_MODEL,
                title: DEFAULT_GEMINI_FLASH_LITE_MODEL,
                key: DEFAULT_GEMINI_FLASH_LITE_MODEL,
            },
        ];
        if (shouldShowPreviewModels) {
            list.unshift({
                value: PREVIEW_GEMINI_MODEL,
                title: PREVIEW_GEMINI_MODEL,
                key: PREVIEW_GEMINI_MODEL,
            }, {
                value: PREVIEW_GEMINI_FLASH_MODEL,
                title: PREVIEW_GEMINI_FLASH_MODEL,
                key: PREVIEW_GEMINI_FLASH_MODEL,
            });
        }
        return list;
    }, [shouldShowPreviewModels]);
    const options = view === 'main' ? mainOptions : manualOptions;
    // Calculate the initial index based on the preferred model.
    const initialIndex = useMemo(() => {
        const idx = options.findIndex((option) => option.value === preferredModel);
        if (idx !== -1) {
            return idx;
        }
        if (view === 'main') {
            const manualIdx = options.findIndex((o) => o.value === 'Manual');
            return manualIdx !== -1 ? manualIdx : 0;
        }
        return 0;
    }, [preferredModel, options, view]);
    // Handle selection internally (Autonomous Dialog).
    const handleSelect = useCallback((model) => {
        if (model === 'Manual') {
            setView('manual');
            return;
        }
        if (config) {
            config.setModel(model, persistMode ? false : true);
            const event = new ModelSlashCommandEvent(model);
            logModelSlashCommand(config, event);
        }
        onClose();
    }, [config, onClose, persistMode]);
    let header;
    let subheader;
    // Do not show any header or subheader since it's already showing preview model
    // options
    if (shouldShowPreviewModels) {
        header = undefined;
        subheader = undefined;
        // When a user has the access but has not enabled the preview features.
    }
    else if (config?.getHasAccessToPreviewModel()) {
        header = 'Gemini 3 is now available.';
        subheader =
            'Enable "Preview features" in /settings.\nLearn more at https://goo.gle/enable-preview-features';
    }
    else {
        header = 'Gemini 3 is coming soon.';
        subheader = undefined;
    }
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", padding: 1, width: "100%", children: [_jsx(Text, { bold: true, children: "Select Model" }), _jsxs(Box, { flexDirection: "column", children: [header && (_jsx(Box, { marginTop: 1, children: _jsx(ThemedGradient, { children: _jsx(Text, { children: header }) }) })), subheader && _jsx(Text, { children: subheader })] }), _jsx(Box, { marginTop: 1, children: _jsx(DescriptiveRadioButtonSelect, { items: options, onSelect: handleSelect, initialIndex: initialIndex, showNumbers: true }) }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Box, { children: [_jsxs(Text, { color: theme.text.primary, children: ["Remember model for future sessions:", ' '] }), _jsx(Text, { color: theme.status.success, children: persistMode ? 'true' : 'false' })] }), _jsx(Text, { color: theme.text.secondary, children: "(Press Tab to toggle)" })] }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsx(Text, { color: theme.text.secondary, children: '> To use a specific Gemini model on startup, use the --model flag.' }) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsx(Text, { color: theme.text.secondary, children: "(Press Esc to close)" }) })] }));
}
//# sourceMappingURL=ModelDialog.js.map