import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { Notifications } from './Notifications.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppContext } from '../contexts/AppContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useIsScreenReaderEnabled } from 'ink';
import * as fs from 'node:fs/promises';
import { act } from 'react';
// Mock dependencies
vi.mock('../contexts/AppContext.js');
vi.mock('../contexts/UIStateContext.js');
vi.mock('ink', async () => {
    const actual = await vi.importActual('ink');
    return {
        ...actual,
        useIsScreenReaderEnabled: vi.fn(),
    };
});
vi.mock('node:fs/promises', async () => {
    const actual = await vi.importActual('node:fs/promises');
    return {
        ...actual,
        access: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn().mockResolvedValue(undefined),
    };
});
vi.mock('node:os', () => ({
    default: {
        homedir: () => '/mock/home',
    },
}));
vi.mock('node:path', async () => {
    const actual = await vi.importActual('node:path');
    return {
        ...actual,
        default: actual.posix,
    };
});
vi.mock('@google/gemini-cli-core', () => ({
    GEMINI_DIR: '.gemini',
    homedir: () => '/mock/home',
    Storage: {
        getGlobalTempDir: () => '/mock/temp',
    },
}));
vi.mock('../../config/settings.js', () => ({
    DEFAULT_MODEL_CONFIGS: {},
    LoadedSettings: class {
        constructor() {
            // this.merged = {};
        }
    },
}));
describe('Notifications', () => {
    const mockUseAppContext = vi.mocked(useAppContext);
    const mockUseUIState = vi.mocked(useUIState);
    const mockUseIsScreenReaderEnabled = vi.mocked(useIsScreenReaderEnabled);
    const mockFsAccess = vi.mocked(fs.access);
    const mockFsWriteFile = vi.mocked(fs.writeFile);
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAppContext.mockReturnValue({
            startupWarnings: [],
            version: '1.0.0',
        });
        mockUseUIState.mockReturnValue({
            initError: null,
            streamingState: 'idle',
            updateInfo: null,
        });
        mockUseIsScreenReaderEnabled.mockReturnValue(false);
    });
    it('renders nothing when no notifications', () => {
        const { lastFrame } = render(_jsx(Notifications, {}));
        expect(lastFrame()).toBe('');
    });
    it.each([[['Warning 1']], [['Warning 1', 'Warning 2']]])('renders startup warnings: %s', (warnings) => {
        mockUseAppContext.mockReturnValue({
            startupWarnings: warnings,
            version: '1.0.0',
        });
        const { lastFrame } = render(_jsx(Notifications, {}));
        const output = lastFrame();
        warnings.forEach((warning) => {
            expect(output).toContain(warning);
        });
    });
    it('renders init error', () => {
        mockUseUIState.mockReturnValue({
            initError: 'Something went wrong',
            streamingState: 'idle',
            updateInfo: null,
        });
        const { lastFrame } = render(_jsx(Notifications, {}));
        expect(lastFrame()).toMatchSnapshot();
    });
    it('does not render init error when streaming', () => {
        mockUseUIState.mockReturnValue({
            initError: 'Something went wrong',
            streamingState: 'responding',
            updateInfo: null,
        });
        const { lastFrame } = render(_jsx(Notifications, {}));
        expect(lastFrame()).toBe('');
    });
    it('renders update notification', () => {
        mockUseUIState.mockReturnValue({
            initError: null,
            streamingState: 'idle',
            updateInfo: { message: 'Update available' },
        });
        const { lastFrame } = render(_jsx(Notifications, {}));
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders screen reader nudge when enabled and not seen', async () => {
        mockUseIsScreenReaderEnabled.mockReturnValue(true);
        let rejectAccess;
        mockFsAccess.mockImplementation(() => new Promise((_, reject) => {
            rejectAccess = reject;
        }));
        const { lastFrame } = render(_jsx(Notifications, {}));
        // Trigger rejection inside act
        await act(async () => {
            rejectAccess(new Error('File not found'));
        });
        // Wait for effect to propagate
        await vi.waitFor(() => {
            expect(mockFsWriteFile).toHaveBeenCalled();
        });
        expect(lastFrame()).toMatchSnapshot();
    });
    it('does not render screen reader nudge when already seen', async () => {
        mockUseIsScreenReaderEnabled.mockReturnValue(true);
        let resolveAccess;
        mockFsAccess.mockImplementation(() => new Promise((resolve) => {
            resolveAccess = resolve;
        }));
        const { lastFrame } = render(_jsx(Notifications, {}));
        // Trigger resolution inside act
        await act(async () => {
            resolveAccess(undefined);
        });
        expect(lastFrame()).toBe('');
        expect(mockFsWriteFile).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=Notifications.test.js.map