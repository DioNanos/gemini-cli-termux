import { jsx as _jsx } from "react/jsx-runtime";
import { Text, useIsScreenReaderEnabled } from 'ink';
import { CliSpinner } from './CliSpinner.js';
import { useStreamingContext } from '../contexts/StreamingContext.js';
import { StreamingState } from '../types.js';
import { SCREEN_READER_LOADING, SCREEN_READER_RESPONDING, } from '../textConstants.js';
import { theme } from '../semantic-colors.js';
export const GeminiRespondingSpinner = ({ nonRespondingDisplay, spinnerType = 'dots' }) => {
    const streamingState = useStreamingContext();
    const isScreenReaderEnabled = useIsScreenReaderEnabled();
    if (streamingState === StreamingState.Responding) {
        return (_jsx(GeminiSpinner, { spinnerType: spinnerType, altText: SCREEN_READER_RESPONDING }));
    }
    else if (nonRespondingDisplay) {
        return isScreenReaderEnabled ? (_jsx(Text, { children: SCREEN_READER_LOADING })) : (_jsx(Text, { color: theme.text.primary, children: nonRespondingDisplay }));
    }
    return null;
};
export const GeminiSpinner = ({ spinnerType = 'dots', altText, }) => {
    const isScreenReaderEnabled = useIsScreenReaderEnabled();
    return isScreenReaderEnabled ? (_jsx(Text, { children: altText })) : (_jsx(Text, { color: theme.text.primary, children: _jsx(CliSpinner, { type: spinnerType }) }));
};
//# sourceMappingURL=GeminiRespondingSpinner.js.map