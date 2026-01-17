import { jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { tokenLimit } from '@google/gemini-cli-core';
export const ContextUsageDisplay = ({ promptTokenCount, model, terminalWidth, }) => {
    const percentage = promptTokenCount / tokenLimit(model);
    const percentageLeft = ((1 - percentage) * 100).toFixed(0);
    const label = terminalWidth < 100 ? '%' : '% context left';
    return (_jsxs(Text, { color: theme.text.secondary, children: ["(", percentageLeft, label, ")"] }));
};
//# sourceMappingURL=ContextUsageDisplay.js.map