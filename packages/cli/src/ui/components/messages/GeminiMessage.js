import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Box } from 'ink';
import { MarkdownDisplay } from '../../utils/MarkdownDisplay.js';
import { theme } from '../../semantic-colors.js';
import { SCREEN_READER_MODEL_PREFIX } from '../../textConstants.js';
import { useUIState } from '../../contexts/UIStateContext.js';
import { useAlternateBuffer } from '../../hooks/useAlternateBuffer.js';
export const GeminiMessage = ({ text, isPending, availableTerminalHeight, terminalWidth, }) => {
    const { renderMarkdown } = useUIState();
    const prefix = '✦ ';
    const prefixWidth = prefix.length;
    const isAlternateBuffer = useAlternateBuffer();
    return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: prefixWidth, children: _jsx(Text, { color: theme.text.accent, "aria-label": SCREEN_READER_MODEL_PREFIX, children: prefix }) }), _jsx(Box, { flexGrow: 1, flexDirection: "column", children: _jsx(MarkdownDisplay, { text: text, isPending: isPending, availableTerminalHeight: isAlternateBuffer ? undefined : availableTerminalHeight, terminalWidth: terminalWidth, renderMarkdown: renderMarkdown }) })] }));
};
//# sourceMappingURL=GeminiMessage.js.map