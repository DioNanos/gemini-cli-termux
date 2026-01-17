import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
import {} from '../../types.js';
import { MarkdownDisplay } from '../../utils/MarkdownDisplay.js';
export const ToolsList = ({ tools, showDescriptions, terminalWidth, }) => (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Available Gemini CLI tools:" }), _jsx(Box, { height: 1 }), tools.length > 0 ? (tools.map((tool) => (_jsxs(Box, { flexDirection: "row", children: [_jsxs(Text, { color: theme.text.primary, children: ['  ', "- "] }), _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { bold: true, color: theme.text.accent, children: [tool.displayName, " (", tool.name, ")"] }), showDescriptions && tool.description && (_jsx(MarkdownDisplay, { terminalWidth: terminalWidth, text: tool.description, isPending: false }))] })] }, tool.name)))) : (_jsx(Text, { color: theme.text.primary, children: " No tools available" }))] }));
//# sourceMappingURL=ToolsList.js.map