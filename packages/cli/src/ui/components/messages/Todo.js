import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import {} from '@google/gemini-cli-core';
import { theme } from '../../semantic-colors.js';
import { useUIState } from '../../contexts/UIStateContext.js';
import { useMemo } from 'react';
const TodoTitleDisplay = ({ todos }) => {
    const score = useMemo(() => {
        let total = 0;
        let completed = 0;
        for (const todo of todos.todos) {
            if (todo.status !== 'cancelled') {
                total += 1;
                if (todo.status === 'completed') {
                    completed += 1;
                }
            }
        }
        return `${completed}/${total} completed`;
    }, [todos]);
    return (_jsxs(Box, { flexDirection: "row", columnGap: 2, height: 1, children: [_jsx(Text, { color: theme.text.primary, bold: true, "aria-label": "Todo list", children: "Todo" }), _jsxs(Text, { color: theme.text.secondary, children: [score, " (ctrl+t to toggle)"] })] }));
};
const TodoStatusDisplay = ({ status }) => {
    switch (status) {
        case 'completed':
            return (_jsx(Text, { color: theme.status.success, "aria-label": "Completed", children: "\u2713" }));
        case 'in_progress':
            return (_jsx(Text, { color: theme.text.accent, "aria-label": "In Progress", children: "\u00BB" }));
        case 'pending':
            return (_jsx(Text, { color: theme.text.secondary, "aria-label": "Pending", children: "\u2610" }));
        case 'cancelled':
        default:
            return (_jsx(Text, { color: theme.status.error, "aria-label": "Cancelled", children: "\u2717" }));
    }
};
const TodoItemDisplay = ({ todo, wrap, role: ariaRole }) => {
    const textColor = (() => {
        switch (todo.status) {
            case 'in_progress':
                return theme.text.accent;
            case 'completed':
            case 'cancelled':
                return theme.text.secondary;
            default:
                return theme.text.primary;
        }
    })();
    const strikethrough = todo.status === 'cancelled';
    return (_jsxs(Box, { flexDirection: "row", columnGap: 1, "aria-role": ariaRole, children: [_jsx(TodoStatusDisplay, { status: todo.status }), _jsx(Box, { flexShrink: 1, children: _jsx(Text, { color: textColor, wrap: wrap, strikethrough: strikethrough, children: todo.description }) })] }));
};
export const TodoTray = () => {
    const uiState = useUIState();
    const todos = useMemo(() => {
        // Find the most recent todo list written by the WriteTodosTool
        for (let i = uiState.history.length - 1; i >= 0; i--) {
            const entry = uiState.history[i];
            if (entry.type !== 'tool_group') {
                continue;
            }
            const toolGroup = entry;
            for (const tool of toolGroup.tools) {
                if (typeof tool.resultDisplay !== 'object' ||
                    !('todos' in tool.resultDisplay)) {
                    continue;
                }
                return tool.resultDisplay;
            }
        }
        return null;
    }, [uiState.history]);
    const inProgress = useMemo(() => {
        if (todos === null) {
            return null;
        }
        return todos.todos.find((todo) => todo.status === 'in_progress') || null;
    }, [todos]);
    const hasActiveTodos = useMemo(() => {
        if (!todos || !todos.todos)
            return false;
        return todos.todos.some((todo) => todo.status === 'pending' || todo.status === 'in_progress');
    }, [todos]);
    if (todos === null ||
        !todos.todos ||
        todos.todos.length === 0 ||
        (!uiState.showFullTodos && !hasActiveTodos)) {
        return null;
    }
    return (_jsx(Box, { borderStyle: "single", borderBottom: false, borderRight: false, borderLeft: false, borderColor: theme.border.default, paddingLeft: 1, paddingRight: 1, children: uiState.showFullTodos ? (_jsxs(Box, { flexDirection: "column", rowGap: 1, children: [_jsx(TodoTitleDisplay, { todos: todos }), _jsx(TodoListDisplay, { todos: todos })] })) : (_jsxs(Box, { flexDirection: "row", columnGap: 1, height: 1, children: [_jsx(Box, { flexShrink: 0, flexGrow: 0, children: _jsx(TodoTitleDisplay, { todos: todos }) }), inProgress && (_jsx(Box, { flexShrink: 1, flexGrow: 1, children: _jsx(TodoItemDisplay, { todo: inProgress, wrap: "truncate" }) }))] })) }));
};
const TodoListDisplay = ({ todos }) => (_jsx(Box, { flexDirection: "column", "aria-role": "list", children: todos.todos.map((todo, index) => (_jsx(TodoItemDisplay, { todo: todo, role: "listitem" }, index))) }));
//# sourceMappingURL=Todo.js.map