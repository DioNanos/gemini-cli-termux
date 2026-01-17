import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Newline, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
export const GeminiPrivacyNotice = ({ onExit }) => {
    useKeypress((key) => {
        if (key.name === 'escape') {
            onExit();
        }
    }, { isActive: true });
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.accent, children: "Gemini API Key Notice" }), _jsx(Newline, {}), _jsxs(Text, { color: theme.text.primary, children: ["By using the Gemini API", _jsx(Text, { color: theme.text.link, children: "[1]" }), ", Google AI Studio", _jsx(Text, { color: theme.status.error, children: "[2]" }), ", and the other Google developer services that reference these terms (collectively, the \"APIs\" or \"Services\"), you are agreeing to Google APIs Terms of Service (the \"API Terms\")", _jsx(Text, { color: theme.status.success, children: "[3]" }), ", and the Gemini API Additional Terms of Service (the \"Additional Terms\")", _jsx(Text, { color: theme.text.accent, children: "[4]" }), "."] }), _jsx(Newline, {}), _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.text.link, children: "[1]" }), ' ', "https://ai.google.dev/docs/gemini_api_overview"] }), _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.status.error, children: "[2]" }), " https://aistudio.google.com/"] }), _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.status.success, children: "[3]" }), ' ', "https://developers.google.com/terms"] }), _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.text.accent, children: "[4]" }), ' ', "https://ai.google.dev/gemini-api/terms"] }), _jsx(Newline, {}), _jsx(Text, { color: theme.text.secondary, children: "Press Esc to exit." })] }));
};
//# sourceMappingURL=GeminiPrivacyNotice.js.map