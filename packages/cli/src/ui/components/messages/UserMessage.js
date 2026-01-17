import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Box } from 'ink';
import { theme } from '../../semantic-colors.js';
import { SCREEN_READER_USER_PREFIX } from '../../textConstants.js';
import { isSlashCommand as checkIsSlashCommand } from '../../utils/commandUtils.js';
export const UserMessage = ({ text, width }) => {
    const prefix = '> ';
    const prefixWidth = prefix.length;
    const isSlashCommand = checkIsSlashCommand(text);
    const textColor = isSlashCommand ? theme.text.accent : theme.text.secondary;
    return (_jsxs(Box, { flexDirection: "row", paddingY: 0, marginY: 1, alignSelf: "flex-start", width: width, children: [_jsx(Box, { width: prefixWidth, flexShrink: 0, children: _jsx(Text, { color: theme.text.accent, "aria-label": SCREEN_READER_USER_PREFIX, children: prefix }) }), _jsx(Box, { flexGrow: 1, children: _jsx(Text, { wrap: "wrap", color: textColor, children: text }) })] }));
};
//# sourceMappingURL=UserMessage.js.map