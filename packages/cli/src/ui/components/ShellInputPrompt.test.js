import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { ShellInputPrompt } from './ShellInputPrompt.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShellExecutionService } from '@google/gemini-cli-core';
// Mock useKeypress
const mockUseKeypress = vi.fn();
vi.mock('../hooks/useKeypress.js', () => ({
    useKeypress: (handler, options) => mockUseKeypress(handler, options),
}));
// Mock ShellExecutionService
vi.mock('@google/gemini-cli-core', async () => {
    const actual = await vi.importActual('@google/gemini-cli-core');
    return {
        ...actual,
        ShellExecutionService: {
            writeToPty: vi.fn(),
            scrollPty: vi.fn(),
        },
    };
});
describe('ShellInputPrompt', () => {
    const mockWriteToPty = vi.mocked(ShellExecutionService.writeToPty);
    const mockScrollPty = vi.mocked(ShellExecutionService.scrollPty);
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders nothing', () => {
        const { lastFrame } = render(_jsx(ShellInputPrompt, { activeShellPtyId: 1, focus: true }));
        expect(lastFrame()).toBe('');
    });
    it.each([
        ['a', 'a'],
        ['b', 'b'],
    ])('handles keypress input: %s', (name, sequence) => {
        render(_jsx(ShellInputPrompt, { activeShellPtyId: 1, focus: true }));
        // Get the registered handler
        const handler = mockUseKeypress.mock.calls[0][0];
        // Simulate keypress
        handler({ name, sequence, ctrl: false, shift: false, meta: false });
        expect(mockWriteToPty).toHaveBeenCalledWith(1, sequence);
    });
    it.each([
        ['up', -1],
        ['down', 1],
    ])('handles scroll %s (Ctrl+Shift+%s)', (key, direction) => {
        render(_jsx(ShellInputPrompt, { activeShellPtyId: 1, focus: true }));
        const handler = mockUseKeypress.mock.calls[0][0];
        handler({ name: key, ctrl: true, shift: true, meta: false });
        expect(mockScrollPty).toHaveBeenCalledWith(1, direction);
    });
    it('does not handle input when not focused', () => {
        render(_jsx(ShellInputPrompt, { activeShellPtyId: 1, focus: false }));
        const handler = mockUseKeypress.mock.calls[0][0];
        handler({
            name: 'a',
            sequence: 'a',
            ctrl: false,
            shift: false,
            meta: false,
        });
        expect(mockWriteToPty).not.toHaveBeenCalled();
    });
    it('does not handle input when no active shell', () => {
        render(_jsx(ShellInputPrompt, { activeShellPtyId: null, focus: true }));
        const handler = mockUseKeypress.mock.calls[0][0];
        handler({
            name: 'a',
            sequence: 'a',
            ctrl: false,
            shift: false,
            meta: false,
        });
        expect(mockWriteToPty).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=ShellInputPrompt.test.js.map