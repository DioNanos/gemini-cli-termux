import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { Notifications } from '../components/Notifications.js';
import { MainContent } from '../components/MainContent.js';
import { DialogManager } from '../components/DialogManager.js';
import { Composer } from '../components/Composer.js';
import { Footer } from '../components/Footer.js';
import { ExitWarning } from '../components/ExitWarning.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useFlickerDetector } from '../hooks/useFlickerDetector.js';
export const ScreenReaderAppLayout = () => {
    const uiState = useUIState();
    const { rootUiRef, terminalHeight } = uiState;
    useFlickerDetector(rootUiRef, terminalHeight);
    return (_jsxs(Box, { flexDirection: "column", width: "90%", height: "100%", ref: uiState.rootUiRef, children: [_jsx(Notifications, {}), _jsx(Footer, {}), _jsx(Box, { flexGrow: 1, overflow: "hidden", children: _jsx(MainContent, {}) }), uiState.dialogsVisible ? (_jsx(DialogManager, { terminalWidth: uiState.terminalWidth, addItem: uiState.historyManager.addItem })) : (_jsx(Composer, {})), _jsx(ExitWarning, {})] }));
};
//# sourceMappingURL=ScreenReaderAppLayout.js.map