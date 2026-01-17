import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
import { RenderInline } from '../../utils/InlineMarkdownRenderer.js';
export const WarningMessage = ({ text }) => {
    const prefix = '⚠ ';
    const prefixWidth = 3;
    return (_jsxs(Box, { flexDirection: "row", marginTop: 1, children: [_jsx(Box, { width: prefixWidth, children: _jsx(Text, { color: theme.status.warning, children: prefix }) }), _jsx(Box, { flexGrow: 1, children: _jsx(Text, { wrap: "wrap", children: _jsx(RenderInline, { text: text, defaultColor: theme.status.warning }) }) })] }));
};
//# sourceMappingURL=WarningMessage.js.map