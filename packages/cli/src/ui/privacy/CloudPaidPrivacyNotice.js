import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box, Newline, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
export const CloudPaidPrivacyNotice = ({ onExit, }) => {
    useKeypress((key) => {
        if (key.name === 'escape') {
            onExit();
        }
    }, { isActive: true });
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.accent, children: "Vertex AI Notice" }), _jsx(Newline, {}), _jsxs(Text, { color: theme.text.primary, children: ["Service Specific Terms", _jsx(Text, { color: theme.text.link, children: "[1]" }), " are incorporated into the agreement under which Google has agreed to provide Google Cloud Platform", _jsx(Text, { color: theme.status.success, children: "[2]" }), " to Customer (the \u201CAgreement\u201D). If the Agreement authorizes the resale or supply of Google Cloud Platform under a Google Cloud partner or reseller program, then except for in the section entitled \u201CPartner-Specific Terms\u201D, all references to Customer in the Service Specific Terms mean Partner or Reseller (as applicable), and all references to Customer Data in the Service Specific Terms mean Partner Data. Capitalized terms used but not defined in the Service Specific Terms have the meaning given to them in the Agreement."] }), _jsx(Newline, {}), _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.text.link, children: "[1]" }), ' ', "https://cloud.google.com/terms/service-terms"] }), _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.status.success, children: "[2]" }), ' ', "https://cloud.google.com/terms/services"] }), _jsx(Newline, {}), _jsx(Text, { color: theme.text.secondary, children: "Press Esc to exit." })] }));
};
//# sourceMappingURL=CloudPaidPrivacyNotice.js.map