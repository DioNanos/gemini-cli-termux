import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Text } from 'ink';
import { ThemedGradient } from './ThemedGradient.js';
import { theme } from '../semantic-colors.js';
export function getFormattedBannerContent(rawText, isWarning, subsequentLineColor) {
    if (isWarning) {
        return (_jsx(Text, { color: theme.status.warning, children: rawText.replace(/\\n/g, '\n') }));
    }
    const text = rawText.replace(/\\n/g, '\n');
    const lines = text.split('\n');
    return lines.map((line, index) => {
        if (index === 0) {
            return (_jsx(ThemedGradient, { children: _jsx(Text, { children: line }) }, index));
        }
        return (_jsx(Text, { color: subsequentLineColor, children: line }, index));
    });
}
export const Banner = ({ bannerText, isWarning, width }) => {
    const subsequentLineColor = theme.text.primary;
    const formattedBannerContent = getFormattedBannerContent(bannerText, isWarning, subsequentLineColor);
    return (_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: isWarning ? theme.status.warning : theme.border.default, width: width, paddingLeft: 1, paddingRight: 1, children: formattedBannerContent }));
};
//# sourceMappingURL=Banner.js.map