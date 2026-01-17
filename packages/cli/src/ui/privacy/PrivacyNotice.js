import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box } from 'ink';
import { AuthType } from '@google/gemini-cli-core';
import { GeminiPrivacyNotice } from './GeminiPrivacyNotice.js';
import { CloudPaidPrivacyNotice } from './CloudPaidPrivacyNotice.js';
import { CloudFreePrivacyNotice } from './CloudFreePrivacyNotice.js';
const PrivacyNoticeText = ({ config, onExit, }) => {
    const authType = config.getContentGeneratorConfig()?.authType;
    switch (authType) {
        case AuthType.USE_GEMINI:
            return _jsx(GeminiPrivacyNotice, { onExit: onExit });
        case AuthType.USE_VERTEX_AI:
            return _jsx(CloudPaidPrivacyNotice, { onExit: onExit });
        case AuthType.LOGIN_WITH_GOOGLE:
        default:
            return _jsx(CloudFreePrivacyNotice, { config: config, onExit: onExit });
    }
};
export const PrivacyNotice = ({ onExit, config }) => (_jsx(Box, { borderStyle: "round", padding: 1, flexDirection: "column", children: _jsx(PrivacyNoticeText, { config: config, onExit: onExit }) }));
//# sourceMappingURL=PrivacyNotice.js.map