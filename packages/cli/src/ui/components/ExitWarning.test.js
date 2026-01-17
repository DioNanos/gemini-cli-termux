import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { ExitWarning } from './ExitWarning.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUIState } from '../contexts/UIStateContext.js';
vi.mock('../contexts/UIStateContext.js');
describe('ExitWarning', () => {
    const mockUseUIState = vi.mocked(useUIState);
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders nothing by default', () => {
        mockUseUIState.mockReturnValue({
            dialogsVisible: false,
            ctrlCPressedOnce: false,
            ctrlDPressedOnce: false,
        });
        const { lastFrame } = render(_jsx(ExitWarning, {}));
        expect(lastFrame()).toBe('');
    });
    it('renders Ctrl+C warning when pressed once and dialogs visible', () => {
        mockUseUIState.mockReturnValue({
            dialogsVisible: true,
            ctrlCPressedOnce: true,
            ctrlDPressedOnce: false,
        });
        const { lastFrame } = render(_jsx(ExitWarning, {}));
        expect(lastFrame()).toContain('Press Ctrl+C again to exit');
    });
    it('renders Ctrl+D warning when pressed once and dialogs visible', () => {
        mockUseUIState.mockReturnValue({
            dialogsVisible: true,
            ctrlCPressedOnce: false,
            ctrlDPressedOnce: true,
        });
        const { lastFrame } = render(_jsx(ExitWarning, {}));
        expect(lastFrame()).toContain('Press Ctrl+D again to exit');
    });
    it('renders nothing if dialogs are not visible', () => {
        mockUseUIState.mockReturnValue({
            dialogsVisible: false,
            ctrlCPressedOnce: true,
            ctrlDPressedOnce: true,
        });
        const { lastFrame } = render(_jsx(ExitWarning, {}));
        expect(lastFrame()).toBe('');
    });
});
//# sourceMappingURL=ExitWarning.test.js.map