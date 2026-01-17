import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from 'ink';
import Gradient from 'ink-gradient';
import { theme } from '../semantic-colors.js';
export const ThemedGradient = ({ children, ...props }) => {
    const gradient = theme.ui.gradient;
    if (gradient && gradient.length >= 2) {
        return (_jsx(Gradient, { colors: gradient, children: _jsx(Text, { ...props, children: children }) }));
    }
    if (gradient && gradient.length === 1) {
        return (_jsx(Text, { color: gradient[0], ...props, children: children }));
    }
    // Fallback to accent color if no gradient
    return (_jsx(Text, { color: theme.text.accent, ...props, children: children }));
};
//# sourceMappingURL=ThemedGradient.js.map