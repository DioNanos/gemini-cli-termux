import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
export const ChatList = ({ chats }) => {
    if (chats.length === 0) {
        return _jsx(Text, { children: "No saved conversation checkpoints found." });
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "List of saved conversations:" }), _jsx(Box, { height: 1 }), chats.map((chat) => {
                const isoString = chat.mtime;
                const match = isoString.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
                const formattedDate = match
                    ? `${match[1]} ${match[2]}`
                    : 'Invalid Date';
                return (_jsx(Box, { flexDirection: "row", children: _jsxs(Text, { children: ['  ', "- ", _jsx(Text, { color: theme.text.accent, children: chat.name }), ' ', _jsxs(Text, { color: theme.text.secondary, children: ["(", formattedDate, ")"] })] }) }, chat.name));
            }), _jsx(Box, { height: 1 }), _jsx(Text, { color: theme.text.secondary, children: "Note: Newest last, oldest first" })] }));
};
//# sourceMappingURL=ChatList.js.map