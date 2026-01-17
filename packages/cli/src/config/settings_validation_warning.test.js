/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
const mockCoreEvents = vi.hoisted(() => ({
    emitFeedback: vi.fn(),
    emitConsoleLog: vi.fn(),
    emitOutput: vi.fn(),
    emitModelChanged: vi.fn(),
    drainBacklogs: vi.fn(),
}));
const mockIsWorkspaceTrusted = vi.hoisted(() => vi.fn().mockReturnValue({ isTrusted: true, source: 'file' }));
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        coreEvents: mockCoreEvents,
        homedir: () => '/mock/home/user',
        Storage: class extends actual.Storage {
            static getGlobalSettingsPath = () => '/mock/home/user/.gemini/settings.json';
            getWorkspaceSettingsPath = () => '/mock/workspace/.gemini/settings.json';
            static getGlobalGeminiDir = () => '/mock/home/user/.gemini';
        },
    };
});
vi.mock('./trustedFolders.js', () => ({
    isWorkspaceTrusted: mockIsWorkspaceTrusted,
    loadTrustedFolders: vi.fn().mockReturnValue({
        isPathTrusted: vi.fn().mockReturnValue(true),
        user: { config: {} },
        errors: [],
    }),
    isFolderTrustEnabled: vi.fn().mockReturnValue(false),
    TrustLevel: {
        TRUST_FOLDER: 'TRUST_FOLDER',
        TRUST_PARENT: 'TRUST_PARENT',
        DO_NOT_TRUST: 'DO_NOT_TRUST',
    },
}));
vi.mock('os', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        homedir: () => '/mock/home/user',
        platform: () => 'linux',
        totalmem: () => 16 * 1024 * 1024 * 1024,
    };
});
vi.mock('fs', async (importOriginal) => {
    const actualFs = await importOriginal();
    return {
        ...actualFs,
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
        renameSync: vi.fn(),
        realpathSync: (p) => p,
    };
});
// Import loadSettings after all mocks are defined
import { loadSettings, USER_SETTINGS_PATH, } from './settings.js';
const MOCK_WORKSPACE_DIR = '/mock/workspace';
describe('Settings Validation Warning', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fs.readFileSync.mockReturnValue('{}');
        fs.existsSync.mockReturnValue(false);
    });
    it('should emit a warning and NOT throw when settings are invalid', () => {
        fs.existsSync.mockImplementation((p) => p === USER_SETTINGS_PATH);
        const invalidSettingsContent = {
            ui: {
                customThemes: {
                    terafox: {
                        name: 'terafox',
                        type: 'custom',
                        DiffModified: '#ffffff', // Invalid key
                    },
                },
            },
        };
        fs.readFileSync.mockImplementation((p) => {
            if (p === USER_SETTINGS_PATH)
                return JSON.stringify(invalidSettingsContent);
            return '{}';
        });
        // Should NOT throw
        let settings;
        expect(() => {
            settings = loadSettings(MOCK_WORKSPACE_DIR);
        }).not.toThrow();
        // Should have recorded a warning in the settings object
        expect(settings?.errors.some((e) => e.message.includes("Unrecognized key(s) in object: 'DiffModified'"))).toBe(true);
    });
    it('should throw a fatal error when settings file is not a valid JSON object', () => {
        fs.existsSync.mockImplementation((p) => p === USER_SETTINGS_PATH);
        fs.readFileSync.mockImplementation((p) => {
            if (p === USER_SETTINGS_PATH)
                return '[]';
            return '{}';
        });
        expect(() => {
            loadSettings(MOCK_WORKSPACE_DIR);
        }).toThrow();
    });
    it('should throw a fatal error when settings file contains invalid JSON', () => {
        fs.existsSync.mockImplementation((p) => p === USER_SETTINGS_PATH);
        fs.readFileSync.mockImplementation((p) => {
            if (p === USER_SETTINGS_PATH)
                return '{ "invalid": "json", }'; // Trailing comma is invalid in standard JSON
            return '{}';
        });
        expect(() => {
            loadSettings(MOCK_WORKSPACE_DIR);
        }).toThrow();
    });
});
//# sourceMappingURL=settings_validation_warning.test.js.map