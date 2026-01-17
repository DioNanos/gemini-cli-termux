import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { shortenPath, tildeifyPath, getDisplayString, } from '@google/gemini-cli-core';
import { ConsoleSummaryDisplay } from './ConsoleSummaryDisplay.js';
import process from 'node:process';
import { ThemedGradient } from './ThemedGradient.js';
import { MemoryUsageDisplay } from './MemoryUsageDisplay.js';
import { ContextUsageDisplay } from './ContextUsageDisplay.js';
import { DebugProfiler } from './DebugProfiler.js';
import { isDevelopment } from '../../utils/installationInfo.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useVimMode } from '../contexts/VimModeContext.js';
export const Footer = () => {
    const uiState = useUIState();
    const config = useConfig();
    const settings = useSettings();
    const { vimEnabled, vimMode } = useVimMode();
    const { model, targetDir, debugMode, branchName, debugMessage, corgiMode, errorCount, showErrorDetails, promptTokenCount, nightly, isTrustedFolder, mainAreaWidth, } = {
        model: uiState.currentModel,
        targetDir: config.getTargetDir(),
        debugMode: config.getDebugMode(),
        branchName: uiState.branchName,
        debugMessage: uiState.debugMessage,
        corgiMode: uiState.corgiMode,
        errorCount: uiState.errorCount,
        showErrorDetails: uiState.showErrorDetails,
        promptTokenCount: uiState.sessionStats.lastPromptTokenCount,
        nightly: uiState.nightly,
        isTrustedFolder: uiState.isTrustedFolder,
        mainAreaWidth: uiState.mainAreaWidth,
    };
    const showMemoryUsage = config.getDebugMode() || settings.merged.ui.showMemoryUsage;
    const hideCWD = settings.merged.ui.footer.hideCWD;
    const hideSandboxStatus = settings.merged.ui.footer.hideSandboxStatus;
    const hideModelInfo = settings.merged.ui.footer.hideModelInfo;
    const hideContextPercentage = settings.merged.ui.footer.hideContextPercentage;
    const pathLength = Math.max(20, Math.floor(mainAreaWidth * 0.25));
    const displayPath = shortenPath(tildeifyPath(targetDir), pathLength);
    const justifyContent = hideCWD && hideModelInfo ? 'center' : 'space-between';
    const displayVimMode = vimEnabled ? vimMode : undefined;
    const showDebugProfiler = debugMode || isDevelopment;
    return (_jsxs(Box, { justifyContent: justifyContent, width: mainAreaWidth, flexDirection: "row", alignItems: "center", paddingX: 1, children: [(showDebugProfiler || displayVimMode || !hideCWD) && (_jsxs(Box, { children: [showDebugProfiler && _jsx(DebugProfiler, {}), displayVimMode && (_jsxs(Text, { color: theme.text.secondary, children: ["[", displayVimMode, "] "] })), !hideCWD &&
                        (nightly ? (_jsxs(ThemedGradient, { children: [displayPath, branchName && _jsxs(Text, { children: [" (", branchName, "*)"] })] })) : (_jsxs(Text, { color: theme.text.link, children: [displayPath, branchName && (_jsxs(Text, { color: theme.text.secondary, children: [" (", branchName, "*)"] }))] }))), debugMode && (_jsx(Text, { color: theme.status.error, children: ' ' + (debugMessage || '--debug') }))] })), !hideSandboxStatus && (_jsx(Box, { flexGrow: 1, alignItems: "center", justifyContent: "center", display: "flex", children: isTrustedFolder === false ? (_jsx(Text, { color: theme.status.warning, children: "untrusted" })) : process.env['SANDBOX'] &&
                    process.env['SANDBOX'] !== 'sandbox-exec' ? (_jsx(Text, { color: "green", children: process.env['SANDBOX'].replace(/^gemini-(?:cli-)?/, '') })) : process.env['SANDBOX'] === 'sandbox-exec' ? (_jsxs(Text, { color: theme.status.warning, children: ["macOS Seatbelt", ' ', _jsxs(Text, { color: theme.text.secondary, children: ["(", process.env['SEATBELT_PROFILE'], ")"] })] })) : (_jsxs(Text, { color: theme.status.error, children: ["no sandbox", mainAreaWidth >= 100 && (_jsx(Text, { color: theme.text.secondary, children: " (see /docs)" }))] })) })), !hideModelInfo && (_jsxs(Box, { alignItems: "center", justifyContent: "flex-end", children: [_jsxs(Box, { alignItems: "center", children: [_jsxs(Text, { color: theme.text.accent, children: [getDisplayString(model, config.getPreviewFeatures()), _jsx(Text, { color: theme.text.secondary, children: " /model" }), !hideContextPercentage && (_jsxs(_Fragment, { children: [' ', _jsx(ContextUsageDisplay, { promptTokenCount: promptTokenCount, model: model, terminalWidth: mainAreaWidth })] }))] }), showMemoryUsage && _jsx(MemoryUsageDisplay, {})] }), _jsxs(Box, { alignItems: "center", children: [corgiMode && (_jsx(Box, { paddingLeft: 1, flexDirection: "row", children: _jsxs(Text, { children: [_jsx(Text, { color: theme.ui.symbol, children: "| " }), _jsx(Text, { color: theme.status.error, children: "\u25BC" }), _jsx(Text, { color: theme.text.primary, children: "(\u00B4" }), _jsx(Text, { color: theme.status.error, children: "\u1D25" }), _jsx(Text, { color: theme.text.primary, children: "`)" }), _jsx(Text, { color: theme.status.error, children: "\u25BC" })] }) })), !showErrorDetails && errorCount > 0 && (_jsxs(Box, { paddingLeft: 1, flexDirection: "row", children: [_jsx(Text, { color: theme.ui.comment, children: "| " }), _jsx(ConsoleSummaryDisplay, { errorCount: errorCount })] }))] })] }))] }));
};
//# sourceMappingURL=Footer.js.map