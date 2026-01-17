import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiAuthDialog } from './ApiAuthDialog.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { useTextBuffer, } from '../components/shared/text-buffer.js';
import { clearApiKey } from '@google/gemini-cli-core';
// Mocks
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        clearApiKey: vi.fn().mockResolvedValue(undefined),
    };
});
vi.mock('../hooks/useKeypress.js', () => ({
    useKeypress: vi.fn(),
}));
vi.mock('../components/shared/text-buffer.js', () => ({
    useTextBuffer: vi.fn(),
}));
vi.mock('../contexts/UIStateContext.js', () => ({
    useUIState: vi.fn(() => ({
        mainAreaWidth: 80,
    })),
}));
const mockedUseKeypress = useKeypress;
const mockedUseTextBuffer = useTextBuffer;
describe('ApiAuthDialog', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    let mockBuffer;
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('GEMINI_API_KEY', '');
        mockBuffer = {
            text: '',
            lines: [''],
            cursor: [0, 0],
            visualCursor: [0, 0],
            viewportVisualLines: [''],
            handleInput: vi.fn(),
            setText: vi.fn((newText) => {
                mockBuffer.text = newText;
                mockBuffer.viewportVisualLines = [newText];
            }),
        };
        mockedUseTextBuffer.mockReturnValue(mockBuffer);
    });
    it('renders correctly', () => {
        const { lastFrame } = render(_jsx(ApiAuthDialog, { onSubmit: onSubmit, onCancel: onCancel }));
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders with a defaultValue', () => {
        render(_jsx(ApiAuthDialog, { onSubmit: onSubmit, onCancel: onCancel, defaultValue: "test-key" }));
        expect(mockedUseTextBuffer).toHaveBeenCalledWith(expect.objectContaining({
            initialText: 'test-key',
            viewport: expect.objectContaining({
                height: 4,
            }),
        }));
    });
    it.each([
        {
            keyName: 'return',
            sequence: '\r',
            expectedCall: onSubmit,
            args: ['submitted-key'],
        },
        { keyName: 'escape', sequence: '\u001b', expectedCall: onCancel, args: [] },
    ])('calls $expectedCall.name when $keyName is pressed', ({ keyName, sequence, expectedCall, args }) => {
        mockBuffer.text = 'submitted-key'; // Set for the onSubmit case
        render(_jsx(ApiAuthDialog, { onSubmit: onSubmit, onCancel: onCancel }));
        // calls[0] is the ApiAuthDialog's useKeypress (Ctrl+C handler)
        // calls[1] is the TextInput's useKeypress (typing handler)
        const keypressHandler = mockedUseKeypress.mock.calls[1][0];
        keypressHandler({
            name: keyName,
            sequence,
            ctrl: false,
            meta: false,
            shift: false,
        });
        expect(expectedCall).toHaveBeenCalledWith(...args);
    });
    it('displays an error message', () => {
        const { lastFrame } = render(_jsx(ApiAuthDialog, { onSubmit: onSubmit, onCancel: onCancel, error: "Invalid API Key" }));
        expect(lastFrame()).toContain('Invalid API Key');
    });
    it('calls clearApiKey and clears buffer when Ctrl+C is pressed', async () => {
        render(_jsx(ApiAuthDialog, { onSubmit: onSubmit, onCancel: onCancel }));
        // calls[0] is the ApiAuthDialog's useKeypress (Ctrl+C handler)
        const keypressHandler = mockedUseKeypress.mock.calls[0][0];
        await keypressHandler({
            name: 'c',
            ctrl: true,
            meta: false,
            shift: false,
        });
        expect(clearApiKey).toHaveBeenCalled();
        expect(mockBuffer.setText).toHaveBeenCalledWith('');
    });
});
//# sourceMappingURL=ApiAuthDialog.test.js.map