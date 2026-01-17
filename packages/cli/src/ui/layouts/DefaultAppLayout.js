import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { Notifications } from '../components/Notifications.js';
import { MainContent } from '../components/MainContent.js';
import { DialogManager } from '../components/DialogManager.js';
import { Composer } from '../components/Composer.js';
import { ExitWarning } from '../components/ExitWarning.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useFlickerDetector } from '../hooks/useFlickerDetector.js';
import { useAlternateBuffer } from '../hooks/useAlternateBuffer.js';
import { CopyModeWarning } from '../components/CopyModeWarning.js';
export const DefaultAppLayout = () => {
    const uiState = useUIState();
    const isAlternateBuffer = useAlternateBuffer();
    const { rootUiRef, terminalHeight } = uiState;
    useFlickerDetector(rootUiRef, terminalHeight);
    // If in alternate buffer mode, need to leave room to draw the scrollbar on
    // the right side of the terminal.
    const width = isAlternateBuffer
        ? uiState.terminalWidth
        : uiState.mainAreaWidth;
    return (_jsxs(Box, { flexDirection: "column", width: width, height: isAlternateBuffer ? terminalHeight - 1 : undefined, flexShrink: 0, flexGrow: 0, overflow: "hidden", ref: uiState.rootUiRef, children: [_jsx(MainContent, {}), _jsxs(Box, { flexDirection: "column", ref: uiState.mainControlsRef, flexShrink: 0, flexGrow: 0, children: [_jsx(Notifications, {}), _jsx(CopyModeWarning, {}), uiState.customDialog ? (uiState.customDialog) : uiState.dialogsVisible ? (_jsx(DialogManager, { terminalWidth: uiState.mainAreaWidth, addItem: uiState.historyManager.addItem })) : (_jsx(Composer, {})), _jsx(ExitWarning, {})] })] }));
};
//# sourceMappingURL=DefaultAppLayout.js.map