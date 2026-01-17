import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Box } from 'ink';
import { Header } from './Header.js';
import { Tips } from './Tips.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { Banner } from './Banner.js';
import { useBanner } from '../hooks/useBanner.js';
export const AppHeader = ({ version }) => {
    const settings = useSettings();
    const config = useConfig();
    const { nightly, mainAreaWidth, bannerData, bannerVisible } = useUIState();
    const { bannerText } = useBanner(bannerData, config);
    return (_jsxs(Box, { flexDirection: "column", children: [!(settings.merged.ui.hideBanner || config.getScreenReader()) && (_jsxs(_Fragment, { children: [_jsx(Header, { version: version, nightly: nightly }), bannerVisible && bannerText && (_jsx(Banner, { width: mainAreaWidth, bannerText: bannerText, isWarning: bannerData.warningText !== '' }))] })), !(settings.merged.ui.hideTips || config.getScreenReader()) && (_jsx(Tips, { config: config }))] }));
};
//# sourceMappingURL=AppHeader.js.map