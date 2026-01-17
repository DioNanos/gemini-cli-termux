import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
export const ConsoleSummaryDisplay = ({ errorCount, }) => {
    if (errorCount === 0) {
        return null;
    }
    const errorIcon = '\u2716'; // Heavy multiplication x (✖)
    return (_jsx(Box, { children: errorCount > 0 && (_jsxs(Text, { color: theme.status.error, children: [errorIcon, " ", errorCount, " error", errorCount > 1 ? 's' : '', ' ', _jsx(Text, { color: theme.text.secondary, children: "(F12 for details)" })] })) }));
};
//# sourceMappingURL=ConsoleSummaryDisplay.js.map