import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useUIState } from '../contexts/UIStateContext.js';
import { theme } from '../semantic-colors.js';
export const CopyModeWarning = () => {
    const { copyModeEnabled } = useUIState();
    if (!copyModeEnabled) {
        return null;
    }
    return (_jsx(Box, { children: _jsx(Text, { color: theme.status.warning, children: "In Copy Mode. Press any key to exit." }) }));
};
//# sourceMappingURL=CopyModeWarning.js.map