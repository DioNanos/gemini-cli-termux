import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from 'ink';
import { theme } from '../semantic-colors.js';
import {} from '../types.js';
export const HookStatusDisplay = ({ activeHooks, }) => {
    if (activeHooks.length === 0) {
        return null;
    }
    const label = activeHooks.length > 1 ? 'Executing Hooks' : 'Executing Hook';
    const displayNames = activeHooks.map((hook) => {
        let name = hook.name;
        if (hook.index && hook.total && hook.total > 1) {
            name += ` (${hook.index}/${hook.total})`;
        }
        return name;
    });
    const text = `${label}: ${displayNames.join(', ')}`;
    return (_jsx(Text, { color: theme.status.warning, wrap: "truncate", children: text }));
};
//# sourceMappingURL=HookStatusDisplay.js.map