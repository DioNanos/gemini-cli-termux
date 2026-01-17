import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Box } from 'ink';
import { theme } from '../../semantic-colors.js';
export const ErrorMessage = ({ text }) => {
    const prefix = '✕ ';
    const prefixWidth = prefix.length;
    return (_jsxs(Box, { flexDirection: "row", marginBottom: 1, children: [_jsx(Box, { width: prefixWidth, children: _jsx(Text, { color: theme.status.error, children: prefix }) }), _jsx(Box, { flexGrow: 1, children: _jsx(Text, { wrap: "wrap", color: theme.status.error, children: text }) })] }));
};
//# sourceMappingURL=ErrorMessage.js.map