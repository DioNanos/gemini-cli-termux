import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Text, Box } from 'ink';
import { useKeypress } from '../../hooks/useKeypress.js';
import chalk from 'chalk';
import { theme } from '../../semantic-colors.js';
import { cpSlice } from '../../utils/textUtils.js';
export function TextInput({ buffer, placeholder = '', onSubmit, onCancel, focus = true, }) {
    const { text, handleInput, visualCursor, viewportVisualLines, visualScrollRow, } = buffer;
    const [cursorVisualRowAbsolute, cursorVisualColAbsolute] = visualCursor;
    const handleKeyPress = useCallback((key) => {
        if (key.name === 'escape') {
            onCancel?.();
            return;
        }
        if (key.name === 'return') {
            onSubmit?.(text);
            return;
        }
        handleInput(key);
    }, [handleInput, onCancel, onSubmit, text]);
    useKeypress(handleKeyPress, { isActive: focus });
    const showPlaceholder = text.length === 0 && placeholder;
    if (showPlaceholder) {
        return (_jsx(Box, { children: focus ? (_jsxs(Text, { children: [chalk.inverse(placeholder[0] || ' '), _jsx(Text, { color: theme.text.secondary, children: placeholder.slice(1) })] })) : (_jsx(Text, { color: theme.text.secondary, children: placeholder })) }));
    }
    return (_jsx(Box, { flexDirection: "column", children: viewportVisualLines.map((lineText, idx) => {
            const currentVisualRow = visualScrollRow + idx;
            const isCursorLine = focus && currentVisualRow === cursorVisualRowAbsolute;
            const lineDisplay = isCursorLine
                ? cpSlice(lineText, 0, cursorVisualColAbsolute) +
                    chalk.inverse(cpSlice(lineText, cursorVisualColAbsolute, cursorVisualColAbsolute + 1) || ' ') +
                    cpSlice(lineText, cursorVisualColAbsolute + 1)
                : lineText;
            return (_jsx(Box, { height: 1, children: _jsx(Text, { children: lineDisplay }) }, idx));
        }) }));
}
//# sourceMappingURL=TextInput.js.map