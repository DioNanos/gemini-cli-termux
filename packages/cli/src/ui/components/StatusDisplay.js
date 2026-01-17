import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { ContextSummaryDisplay } from './ContextSummaryDisplay.js';
import { HookStatusDisplay } from './HookStatusDisplay.js';
export const StatusDisplay = ({ hideContextSummary, }) => {
    const uiState = useUIState();
    const settings = useSettings();
    const config = useConfig();
    if (process.env['GEMINI_SYSTEM_MD']) {
        return _jsx(Text, { color: theme.status.error, children: "|\u2310\u25A0_\u25A0|" });
    }
    if (uiState.ctrlCPressedOnce) {
        return (_jsx(Text, { color: theme.status.warning, children: "Press Ctrl+C again to exit." }));
    }
    if (uiState.warningMessage) {
        return _jsx(Text, { color: theme.status.warning, children: uiState.warningMessage });
    }
    if (uiState.ctrlDPressedOnce) {
        return (_jsx(Text, { color: theme.status.warning, children: "Press Ctrl+D again to exit." }));
    }
    if (uiState.showEscapePrompt) {
        return _jsx(Text, { color: theme.text.secondary, children: "Press Esc again to rewind." });
    }
    if (uiState.queueErrorMessage) {
        return _jsx(Text, { color: theme.status.error, children: uiState.queueErrorMessage });
    }
    if (uiState.activeHooks.length > 0 && settings.merged.hooks.notifications) {
        return _jsx(HookStatusDisplay, { activeHooks: uiState.activeHooks });
    }
    if (!settings.merged.ui.hideContextSummary && !hideContextSummary) {
        return (_jsx(ContextSummaryDisplay, { ideContext: uiState.ideContextState, geminiMdFileCount: uiState.geminiMdFileCount, contextFileNames: uiState.contextFileNames, mcpServers: config.getMcpClientManager()?.getMcpServers() ?? {}, blockedMcpServers: config.getMcpClientManager()?.getBlockedMcpServers() ?? [], skillCount: config.getSkillManager().getDisplayableSkills().length }));
    }
    return null;
};
//# sourceMappingURL=StatusDisplay.js.map