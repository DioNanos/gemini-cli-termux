import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import {} from '@google/gemini-cli-core';
export const Tips = ({ config }) => {
    const geminiMdFileCount = config.getGeminiMdFileCount();
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: theme.text.primary, children: "Tips for getting started:" }), _jsx(Text, { color: theme.text.primary, children: "1. Ask questions, edit files, or run commands." }), _jsx(Text, { color: theme.text.primary, children: "2. Be specific for the best results." }), geminiMdFileCount === 0 && (_jsxs(Text, { color: theme.text.primary, children: ["3. Create", ' ', _jsx(Text, { bold: true, color: theme.text.accent, children: "GEMINI.md" }), ' ', "files to customize your interactions with Gemini."] })), _jsxs(Text, { color: theme.text.primary, children: [geminiMdFileCount === 0 ? '4.' : '3.', ' ', _jsx(Text, { bold: true, color: theme.text.accent, children: "/help" }), ' ', "for more information."] })] }));
};
//# sourceMappingURL=Tips.js.map