import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
export const RawMarkdownIndicator = () => {
    const modKey = process.platform === 'darwin' ? 'option+m' : 'alt+m';
    return (_jsx(Box, { children: _jsxs(Text, { children: ["raw markdown mode", _jsxs(Text, { color: theme.text.secondary, children: [" (", modKey, " to toggle) "] })] }) }));
};
//# sourceMappingURL=RawMarkdownIndicator.js.map