/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeApp } from './initializer.js';
import { IdeClient, logIdeConnection, logCliConfiguration, } from '@google/gemini-cli-core';
import { performInitialAuth } from './auth.js';
import { validateTheme } from './theme.js';
import {} from '../config/settings.js';
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        IdeClient: {
            getInstance: vi.fn(),
        },
        logIdeConnection: vi.fn(),
        logCliConfiguration: vi.fn(),
        StartSessionEvent: vi.fn(),
        IdeConnectionEvent: vi.fn(),
    };
});
vi.mock('./auth.js', () => ({
    performInitialAuth: vi.fn(),
}));
vi.mock('./theme.js', () => ({
    validateTheme: vi.fn(),
}));
describe('initializer', () => {
    let mockConfig;
    let mockSettings;
    let mockIdeClient;
    beforeEach(() => {
        vi.clearAllMocks();
        mockConfig = {
            getToolRegistry: vi.fn(),
            getIdeMode: vi.fn().mockReturnValue(false),
            getGeminiMdFileCount: vi.fn().mockReturnValue(5),
        };
        mockSettings = {
            merged: {
                security: {
                    auth: {
                        selectedType: 'oauth',
                    },
                },
            },
        };
        mockIdeClient = {
            connect: vi.fn(),
        };
        vi.mocked(IdeClient.getInstance).mockResolvedValue(mockIdeClient);
        vi.mocked(performInitialAuth).mockResolvedValue(null);
        vi.mocked(validateTheme).mockReturnValue(null);
    });
    it('should initialize correctly in non-IDE mode', async () => {
        const result = await initializeApp(mockConfig, mockSettings);
        expect(result).toEqual({
            authError: null,
            themeError: null,
            shouldOpenAuthDialog: false,
            geminiMdFileCount: 5,
        });
        expect(performInitialAuth).toHaveBeenCalledWith(mockConfig, 'oauth');
        expect(validateTheme).toHaveBeenCalledWith(mockSettings);
        expect(logCliConfiguration).toHaveBeenCalled();
        expect(IdeClient.getInstance).not.toHaveBeenCalled();
    });
    it('should initialize correctly in IDE mode', async () => {
        mockConfig.getIdeMode.mockReturnValue(true);
        const result = await initializeApp(mockConfig, mockSettings);
        expect(result).toEqual({
            authError: null,
            themeError: null,
            shouldOpenAuthDialog: false,
            geminiMdFileCount: 5,
        });
        expect(IdeClient.getInstance).toHaveBeenCalled();
        expect(mockIdeClient.connect).toHaveBeenCalled();
        expect(logIdeConnection).toHaveBeenCalledWith(mockConfig, expect.any(Object));
    });
    it('should handle auth error', async () => {
        vi.mocked(performInitialAuth).mockResolvedValue('Auth failed');
        const result = await initializeApp(mockConfig, mockSettings);
        expect(result.authError).toBe('Auth failed');
        expect(result.shouldOpenAuthDialog).toBe(true);
    });
    it('should handle undefined auth type', async () => {
        mockSettings.merged.security.auth.selectedType = undefined;
        const result = await initializeApp(mockConfig, mockSettings);
        expect(result.shouldOpenAuthDialog).toBe(true);
    });
    it('should handle theme error', async () => {
        vi.mocked(validateTheme).mockReturnValue('Theme not found');
        const result = await initializeApp(mockConfig, mockSettings);
        expect(result.themeError).toBe('Theme not found');
    });
});
//# sourceMappingURL=initializer.test.js.map