import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { TextInput } from '../components/shared/TextInput.js';
import { useTextBuffer } from '../components/shared/text-buffer.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { clearApiKey, debugLogger } from '@google/gemini-cli-core';
import { useKeypress } from '../hooks/useKeypress.js';
import { keyMatchers, Command } from '../keyMatchers.js';
export function ApiAuthDialog({ onSubmit, onCancel, error, defaultValue = '', }) {
    const { mainAreaWidth } = useUIState();
    const viewportWidth = mainAreaWidth - 8;
    const pendingPromise = useRef(null);
    useEffect(() => () => {
        pendingPromise.current?.cancel();
    }, []);
    const initialApiKey = defaultValue;
    const buffer = useTextBuffer({
        initialText: initialApiKey || '',
        initialCursorOffset: initialApiKey?.length || 0,
        viewport: {
            width: viewportWidth,
            height: 4,
        },
        isValidPath: () => false, // No path validation needed for API key
        inputFilter: (text) => text.replace(/[^a-zA-Z0-9_-]/g, '').replace(/[\r\n]/g, ''),
        singleLine: true,
    });
    const handleSubmit = (value) => {
        onSubmit(value);
    };
    const handleClear = () => {
        pendingPromise.current?.cancel();
        let isCancelled = false;
        const wrappedPromise = new Promise((resolve, reject) => {
            clearApiKey().then(() => !isCancelled && resolve(), (error) => !isCancelled && reject(error));
        });
        pendingPromise.current = {
            cancel: () => {
                isCancelled = true;
            },
        };
        return wrappedPromise
            .then(() => {
            buffer.setText('');
        })
            .catch((err) => {
            debugLogger.debug('Failed to clear API key:', err);
        });
    };
    useKeypress(async (key) => {
        if (keyMatchers[Command.CLEAR_INPUT](key)) {
            await handleClear();
        }
    }, { isActive: true });
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.focused, flexDirection: "column", padding: 1, width: "100%", children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Enter Gemini API Key" }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { color: theme.text.primary, children: "Please enter your Gemini API key. It will be securely stored in your system keychain." }), _jsxs(Text, { color: theme.text.secondary, children: ["You can get an API key from", ' ', _jsx(Text, { color: theme.text.link, children: "https://aistudio.google.com/app/apikey" })] })] }), _jsx(Box, { marginTop: 1, flexDirection: "row", children: _jsx(Box, { borderStyle: "round", borderColor: theme.border.default, paddingX: 1, flexGrow: 1, children: _jsx(TextInput, { buffer: buffer, onSubmit: handleSubmit, onCancel: onCancel, placeholder: "Paste your API key here" }) }) }), error && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.status.error, children: error }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.secondary, children: "(Press Enter to submit, Esc to cancel, Ctrl+C to clear stored key)" }) })] }));
}
//# sourceMappingURL=ApiAuthDialog.js.map