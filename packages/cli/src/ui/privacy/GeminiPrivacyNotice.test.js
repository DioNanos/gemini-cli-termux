import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiPrivacyNotice } from './GeminiPrivacyNotice.js';
import { useKeypress } from '../hooks/useKeypress.js';
// Mocks
vi.mock('../hooks/useKeypress.js', () => ({
    useKeypress: vi.fn(),
}));
const mockedUseKeypress = useKeypress;
describe('GeminiPrivacyNotice', () => {
    const onExit = vi.fn();
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('renders correctly', () => {
        const { lastFrame } = render(_jsx(GeminiPrivacyNotice, { onExit: onExit }));
        expect(lastFrame()).toContain('Gemini API Key Notice');
        expect(lastFrame()).toContain('By using the Gemini API');
        expect(lastFrame()).toContain('Press Esc to exit');
    });
    it('exits on Escape', () => {
        render(_jsx(GeminiPrivacyNotice, { onExit: onExit }));
        const keypressHandler = mockedUseKeypress.mock.calls[0][0];
        keypressHandler({ name: 'escape' });
        expect(onExit).toHaveBeenCalled();
    });
});
//# sourceMappingURL=GeminiPrivacyNotice.test.js.map