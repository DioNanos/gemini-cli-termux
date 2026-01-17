import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { QuittingDisplay } from './QuittingDisplay.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useUIState } from '../contexts/UIStateContext.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
vi.mock('../contexts/UIStateContext.js');
vi.mock('../hooks/useTerminalSize.js');
vi.mock('./HistoryItemDisplay.js', async () => {
    const { Text } = await vi.importActual('ink');
    return {
        HistoryItemDisplay: ({ item }) => React.createElement(Text, null, item.content),
    };
});
describe('QuittingDisplay', () => {
    const mockUseUIState = vi.mocked(useUIState);
    const mockUseTerminalSize = vi.mocked(useTerminalSize);
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTerminalSize.mockReturnValue({ rows: 20, columns: 80 });
    });
    it('renders nothing when no quitting messages', () => {
        mockUseUIState.mockReturnValue({
            quittingMessages: null,
        });
        const { lastFrame } = render(_jsx(QuittingDisplay, {}));
        expect(lastFrame()).toBe('');
    });
    it('renders quitting messages', () => {
        const mockMessages = [
            { id: '1', type: 'user', content: 'Goodbye' },
            { id: '2', type: 'model', content: 'See you later' },
        ];
        mockUseUIState.mockReturnValue({
            quittingMessages: mockMessages,
            constrainHeight: false,
        });
        const { lastFrame } = render(_jsx(QuittingDisplay, {}));
        expect(lastFrame()).toContain('Goodbye');
        expect(lastFrame()).toContain('See you later');
    });
});
//# sourceMappingURL=QuittingDisplay.test.js.map