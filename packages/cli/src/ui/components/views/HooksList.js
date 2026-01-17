import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
export const HooksList = ({ hooks }) => {
    if (hooks.length === 0) {
        return (_jsx(Box, { flexDirection: "column", marginTop: 1, marginBottom: 1, children: _jsx(Box, { marginTop: 1, children: _jsx(Text, { children: "No hooks configured." }) }) }));
    }
    // Group hooks by event name for better organization
    const hooksByEvent = hooks.reduce((acc, hook) => {
        if (!acc[hook.eventName]) {
            acc[hook.eventName] = [];
        }
        acc[hook.eventName].push(hook);
        return acc;
    }, {});
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, marginBottom: 1, children: [_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { color: theme.status.warning, bold: true, underline: true, children: "\u26A0\uFE0F Security Warning:" }), _jsx(Text, { color: theme.status.warning, children: "Hooks can execute arbitrary commands on your system. Only use hooks from sources you trust. Review hook scripts carefully." })] }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: ["Learn more:", ' ', _jsx(Text, { color: theme.text.link, children: "https://geminicli.com/docs/hooks" })] }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { bold: true, children: "Configured Hooks:" }) }), _jsx(Box, { flexDirection: "column", paddingLeft: 2, marginTop: 1, children: Object.entries(hooksByEvent).map(([eventName, eventHooks]) => (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Text, { color: theme.text.accent, bold: true, children: [eventName, ":"] }), _jsx(Box, { flexDirection: "column", paddingLeft: 2, children: eventHooks.map((hook, index) => {
                                const hookName = hook.config.name || hook.config.command || 'unknown';
                                const statusColor = hook.enabled
                                    ? theme.status.success
                                    : theme.text.secondary;
                                const statusText = hook.enabled ? 'enabled' : 'disabled';
                                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { children: _jsxs(Text, { children: [_jsx(Text, { color: theme.text.accent, children: hookName }), _jsx(Text, { color: statusColor, children: ` [${statusText}]` })] }) }), _jsxs(Box, { paddingLeft: 2, flexDirection: "column", children: [hook.config.description && (_jsx(Text, { italic: true, children: hook.config.description })), _jsxs(Text, { dimColor: true, children: ["Source: ", hook.source, hook.config.name &&
                                                            hook.config.command &&
                                                            ` | Command: ${hook.config.command}`, hook.matcher && ` | Matcher: ${hook.matcher}`, hook.sequential && ` | Sequential`, hook.config.timeout &&
                                                            ` | Timeout: ${hook.config.timeout}s`] })] })] }, `${eventName}-${index}`));
                            }) })] }, eventName))) }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { dimColor: true, children: ["Tip: Use ", _jsxs(Text, { bold: true, children: ["/hooks enable ", '<hook-name>'] }), " or", ' ', _jsxs(Text, { bold: true, children: ["/hooks disable ", '<hook-name>'] }), " to toggle individual hooks. Use ", _jsx(Text, { bold: true, children: "/hooks enable-all" }), " or", ' ', _jsx(Text, { bold: true, children: "/hooks disable-all" }), " to toggle all hooks at once."] }) })] }));
};
//# sourceMappingURL=HooksList.js.map