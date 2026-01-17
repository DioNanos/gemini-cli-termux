import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Newline, Text } from 'ink';
import { RadioButtonSelect } from '../components/shared/RadioButtonSelect.js';
import { usePrivacySettings } from '../hooks/usePrivacySettings.js';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
export const CloudFreePrivacyNotice = ({ config, onExit, }) => {
    const { privacyState, updateDataCollectionOptIn } = usePrivacySettings(config);
    useKeypress((key) => {
        if ((privacyState.error || privacyState.isFreeTier === false) &&
            key.name === 'escape') {
            onExit();
        }
    }, { isActive: true });
    if (privacyState.isLoading) {
        return _jsx(Text, { color: theme.text.secondary, children: "Loading..." });
    }
    if (privacyState.error) {
        return (_jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { color: theme.status.error, children: ["Error loading Opt-in settings: ", privacyState.error] }), _jsx(Text, { color: theme.text.secondary, children: "Press Esc to exit." })] }));
    }
    if (privacyState.isFreeTier === false) {
        return (_jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: theme.text.accent, children: "Gemini Code Assist Privacy Notice" }), _jsx(Newline, {}), _jsx(Text, { children: "https://developers.google.com/gemini-code-assist/resources/privacy-notices" }), _jsx(Newline, {}), _jsx(Text, { color: theme.text.secondary, children: "Press Esc to exit." })] }));
    }
    const items = [
        { label: 'Yes', value: true, key: 'true' },
        { label: 'No', value: false, key: 'false' },
    ];
    return (_jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: theme.text.accent, children: "Gemini Code Assist for Individuals Privacy Notice" }), _jsx(Newline, {}), _jsxs(Text, { color: theme.text.primary, children: ["This notice and our Privacy Policy", _jsx(Text, { color: theme.text.link, children: "[1]" }), " describe how Gemini Code Assist handles your data. Please read them carefully."] }), _jsx(Newline, {}), _jsx(Text, { color: theme.text.primary, children: "When you use Gemini Code Assist for individuals with Gemini CLI, Google collects your prompts, related code, generated output, code edits, related feature usage information, and your feedback to provide, improve, and develop Google products and services and machine learning technologies." }), _jsx(Newline, {}), _jsx(Text, { color: theme.text.primary, children: "To help with quality and improve our products (such as generative machine-learning models), human reviewers may read, annotate, and process the data collected above. We take steps to protect your privacy as part of this process. This includes disconnecting the data from your Google Account before reviewers see or annotate it, and storing those disconnected copies for up to 18 months. Please don't submit confidential information or any data you wouldn't want a reviewer to see or Google to use to improve our products, services and machine-learning technologies." }), _jsx(Newline, {}), _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: theme.text.primary, children: "Allow Google to use this data to develop and improve our products?" }), _jsx(RadioButtonSelect, { items: items, initialIndex: privacyState.dataCollectionOptIn ? 0 : 1, onSelect: (value) => {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            updateDataCollectionOptIn(value);
                            // Only exit if there was no error.
                            if (!privacyState.error) {
                                onExit();
                            }
                        } })] }), _jsx(Newline, {}), _jsxs(Text, { children: [_jsx(Text, { color: theme.text.link, children: "[1]" }), ' ', "https://policies.google.com/privacy"] }), _jsx(Newline, {}), _jsx(Text, { color: theme.text.secondary, children: "Press Enter to choose an option and exit." })] }));
};
//# sourceMappingURL=CloudFreePrivacyNotice.js.map