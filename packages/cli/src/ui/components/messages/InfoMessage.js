import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Box } from 'ink';
import { theme } from '../../semantic-colors.js';
import { RenderInline } from '../../utils/InlineMarkdownRenderer.js';
export const InfoMessage = ({ text, icon, color, }) => {
    color ??= theme.status.warning;
    const prefix = icon ?? 'ℹ ';
    const prefixWidth = prefix.length;
    return (_jsxs(Box, { flexDirection: "row", marginTop: 1, children: [_jsx(Box, { width: prefixWidth, children: _jsx(Text, { color: color, children: prefix }) }), _jsx(Box, { flexGrow: 1, flexDirection: "column", children: text.split('\n').map((line, index) => (_jsx(Text, { wrap: "wrap", children: _jsx(RenderInline, { text: line, defaultColor: color }) }, index))) })] }));
};
//# sourceMappingURL=InfoMessage.js.map