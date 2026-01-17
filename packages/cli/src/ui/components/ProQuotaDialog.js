import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { theme } from '../semantic-colors.js';
export function ProQuotaDialog({ failedModel, fallbackModel, message, isTerminalQuotaError, isModelNotFoundError, onChoice, }) {
    let items;
    // Do not provide a fallback option if failed model and fallbackmodel are same.
    if (failedModel === fallbackModel) {
        items = [
            {
                label: 'Keep trying',
                value: 'retry_once',
                key: 'retry_once',
            },
            {
                label: 'Stop',
                value: 'retry_later',
                key: 'retry_later',
            },
        ];
    }
    else if (isModelNotFoundError || isTerminalQuotaError) {
        // free users and out of quota users on G1 pro and Cloud Console gets an option to upgrade
        items = [
            {
                label: `Switch to ${fallbackModel}`,
                value: 'retry_always',
                key: 'retry_always',
            },
            {
                label: 'Upgrade for higher limits',
                value: 'upgrade',
                key: 'upgrade',
            },
            {
                label: `Stop`,
                value: 'retry_later',
                key: 'retry_later',
            },
        ];
    }
    else {
        // capacity error
        items = [
            {
                label: 'Keep trying',
                value: 'retry_once',
                key: 'retry_once',
            },
            {
                label: `Switch to ${fallbackModel}`,
                value: 'retry_always',
                key: 'retry_always',
            },
            {
                label: 'Stop',
                value: 'retry_later',
                key: 'retry_later',
            },
        ];
    }
    const handleSelect = (choice) => {
        onChoice(choice);
    };
    // Helper to highlight simple slash commands in the message
    const renderMessage = (msg) => {
        const parts = msg.split(/(\s+)/);
        return (_jsx(Text, { children: parts.map((part, index) => {
                if (part.startsWith('/')) {
                    return (_jsx(Text, { bold: true, color: theme.text.accent, children: part }, index));
                }
                return _jsx(Text, { children: part }, index);
            }) }));
    };
    return (_jsxs(Box, { borderStyle: "round", flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: renderMessage(message) }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(RadioButtonSelect, { items: items, onSelect: handleSelect }) })] }));
}
//# sourceMappingURL=ProQuotaDialog.js.map