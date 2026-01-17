import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useIsScreenReaderEnabled } from 'ink';
import { useUIState } from './contexts/UIStateContext.js';
import { StreamingContext } from './contexts/StreamingContext.js';
import { QuittingDisplay } from './components/QuittingDisplay.js';
import { ScreenReaderAppLayout } from './layouts/ScreenReaderAppLayout.js';
import { DefaultAppLayout } from './layouts/DefaultAppLayout.js';
import { AlternateBufferQuittingDisplay } from './components/AlternateBufferQuittingDisplay.js';
import { useAlternateBuffer } from './hooks/useAlternateBuffer.js';
export const App = () => {
    const uiState = useUIState();
    const isAlternateBuffer = useAlternateBuffer();
    const isScreenReaderEnabled = useIsScreenReaderEnabled();
    if (uiState.quittingMessages) {
        if (isAlternateBuffer) {
            return (_jsx(StreamingContext.Provider, { value: uiState.streamingState, children: _jsx(AlternateBufferQuittingDisplay, {}) }));
        }
        else {
            return _jsx(QuittingDisplay, {});
        }
    }
    return (_jsx(StreamingContext.Provider, { value: uiState.streamingState, children: isScreenReaderEnabled ? _jsx(ScreenReaderAppLayout, {}) : _jsx(DefaultAppLayout, {}) }));
};
//# sourceMappingURL=App.js.map