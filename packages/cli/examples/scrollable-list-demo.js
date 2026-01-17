import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useStdout } from 'ink';
import { ScrollableList, } from '../src/ui/components/shared/ScrollableList.js';
import { ScrollProvider } from '../src/ui/contexts/ScrollProvider.js';
import { MouseProvider } from '../src/ui/contexts/MouseContext.js';
import { KeypressProvider } from '../src/ui/contexts/KeypressContext.js';
import { enableMouseEvents, disableMouseEvents, } from '../src/ui/utils/mouse.js';
const getLorem = (index) => Array(10)
    .fill(null)
    .map(() => 'lorem ipsum '.repeat((index % 3) + 1).trim())
    .join('\n');
const Demo = () => {
    const { stdout } = useStdout();
    const [size, setSize] = useState({
        columns: stdout.columns,
        rows: stdout.rows,
    });
    useEffect(() => {
        const onResize = () => {
            setSize({
                columns: stdout.columns,
                rows: stdout.rows,
            });
        };
        stdout.on('resize', onResize);
        return () => {
            stdout.off('resize', onResize);
        };
    }, [stdout]);
    const [items, setItems] = useState(() => Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        title: `Item ${i + 1}`,
    })));
    const listRef = useRef(null);
    useInput((input, key) => {
        if (input === 'a' || input === 'A') {
            setItems((prev) => [
                ...prev,
                { id: String(prev.length), title: `Item ${prev.length + 1}` },
            ]);
        }
        if ((input === 'e' || input === 'E') && !key.ctrl) {
            setItems((prev) => {
                if (prev.length === 0)
                    return prev;
                const lastIndex = prev.length - 1;
                const lastItem = prev[lastIndex];
                const newItem = { ...lastItem, title: lastItem.title + 'e' };
                return [...prev.slice(0, lastIndex), newItem];
            });
        }
        if (key.ctrl && input === 'e') {
            listRef.current?.scrollToEnd();
        }
        // Let Ink handle Ctrl+C via exitOnCtrlC (default true) or handle explicitly if needed.
        // For alternate buffer, explicit handling is often safer for cleanup.
        if (key.escape || (key.ctrl && input === 'c')) {
            process.exit(0);
        }
    });
    return (_jsx(MouseProvider, { mouseEventsEnabled: true, children: _jsx(KeypressProvider, { children: _jsx(ScrollProvider, { children: _jsxs(Box, { flexDirection: "column", width: size.columns, height: size.rows - 1, padding: 1, children: [_jsx(Text, { children: "Press 'A' to add an item. Press 'E' to edit last item. Press 'Ctrl+E' to scroll to end. Press 'Esc' to exit. Mouse wheel or Shift+Up/Down to scroll." }), _jsx(Box, { flexGrow: 1, borderStyle: "round", borderColor: "cyan", children: _jsx(ScrollableList, { ref: listRef, data: items, renderItem: ({ item, index }) => (_jsxs(Box, { flexDirection: "column", paddingBottom: 2, children: [_jsx(Box, { sticky: true, flexDirection: "column", width: size.columns - 2, opaque: true, stickyChildren: _jsxs(Box, { flexDirection: "column", width: size.columns - 2, opaque: true, children: [_jsx(Text, { children: item.title }), _jsx(Box, { borderStyle: "single", borderTop: true, borderBottom: false, borderLeft: false, borderRight: false, borderColor: "gray" })] }), children: _jsx(Text, { children: item.title }) }), _jsx(Text, { color: "gray", children: getLorem(index) })] })), estimatedItemHeight: () => 14, keyExtractor: (item) => item.id, hasFocus: true, initialScrollIndex: Number.MAX_SAFE_INTEGER, initialScrollOffsetInIndex: Number.MAX_SAFE_INTEGER }) }), _jsxs(Text, { children: ["Count: ", items.length] })] }) }) }) }));
};
// Enable mouse reporting before rendering
enableMouseEvents();
// Ensure cleanup happens on exit
process.on('exit', () => {
    disableMouseEvents();
});
// Handle SIGINT explicitly to ensure cleanup runs if Ink doesn't catch it in time
process.on('SIGINT', () => {
    process.exit(0);
});
render(_jsx(Demo, {}), { alternateBuffer: true });
//# sourceMappingURL=scrollable-list-demo.js.map