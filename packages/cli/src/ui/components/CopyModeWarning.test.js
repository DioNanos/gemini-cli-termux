import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { CopyModeWarning } from './CopyModeWarning.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUIState } from '../contexts/UIStateContext.js';
vi.mock('../contexts/UIStateContext.js');
describe('CopyModeWarning', () => {
    const mockUseUIState = vi.mocked(useUIState);
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders nothing when copy mode is disabled', () => {
        mockUseUIState.mockReturnValue({
            copyModeEnabled: false,
        });
        const { lastFrame } = render(_jsx(CopyModeWarning, {}));
        expect(lastFrame()).toBe('');
    });
    it('renders warning when copy mode is enabled', () => {
        mockUseUIState.mockReturnValue({
            copyModeEnabled: true,
        });
        const { lastFrame } = render(_jsx(CopyModeWarning, {}));
        expect(lastFrame()).toContain('In Copy Mode');
        expect(lastFrame()).toContain('Press any key to exit');
    });
});
//# sourceMappingURL=CopyModeWarning.test.js.map