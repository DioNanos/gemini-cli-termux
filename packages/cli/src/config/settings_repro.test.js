/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="vitest/globals" />
// Mock 'os' first.
import * as osActual from 'node:os';
vi.mock('os', async (importOriginal) => {
    const actualOs = await importOriginal();
    return {
        ...actualOs,
        homedir: vi.fn(() => '/mock/home/user'),
        platform: vi.fn(() => 'linux'),
    };
});
// Mock './settings.js' to ensure it uses the mocked 'os.homedir()' for its internal constants.
vi.mock('./settings.js', async (importActual) => {
    const originalModule = await importActual();
    return {
        __esModule: true,
        ...originalModule,
    };
});
// Mock trustedFolders
vi.mock('./trustedFolders.js', () => ({
    isWorkspaceTrusted: vi
        .fn()
        .mockReturnValue({ isTrusted: true, source: 'file' }),
}));
import { describe, it, expect, vi, beforeEach, afterEach, } from 'vitest';
import * as fs from 'node:fs';
import stripJsonComments from 'strip-json-comments';
import { isWorkspaceTrusted } from './trustedFolders.js';
import { loadSettings, USER_SETTINGS_PATH } from './settings.js';
const MOCK_WORKSPACE_DIR = '/mock/workspace';
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
vi.mock('./extension.js');
const mockCoreEvents = vi.hoisted(() => ({
    emitFeedback: vi.fn(),
}));
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        coreEvents: mockCoreEvents,
    };
});
vi.mock('../utils/commentJson.js', () => ({
    updateSettingsFilePreservingFormat: vi.fn(),
}));
vi.mock('strip-json-comments', () => ({
    default: vi.fn((content) => content),
}));
describe('Settings Repro', () => {
    let mockFsExistsSync;
    let mockStripJsonComments;
    let mockFsMkdirSync;
    beforeEach(() => {
        vi.resetAllMocks();
        mockFsExistsSync = vi.mocked(fs.existsSync);
        mockFsMkdirSync = vi.mocked(fs.mkdirSync);
        mockStripJsonComments = vi.mocked(stripJsonComments);
        vi.mocked(osActual.homedir).mockReturnValue('/mock/home/user');
        mockStripJsonComments.mockImplementation((jsonString) => jsonString);
        mockFsExistsSync.mockReturnValue(false);
        fs.readFileSync.mockReturnValue('{}');
        mockFsMkdirSync.mockImplementation(() => undefined);
        vi.mocked(isWorkspaceTrusted).mockReturnValue({
            isTrusted: true,
            source: 'file',
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('should handle the problematic settings.json without crashing', () => {
        mockFsExistsSync.mockImplementation((p) => p === USER_SETTINGS_PATH);
        const problemSettingsContent = {
            accessibility: {
                screenReader: true,
            },
            ide: {
                enabled: false,
                hasSeenNudge: true,
            },
            general: {
                debugKeystrokeLogging: false,
                enablePromptCompletion: false,
                preferredEditor: 'vim',
                vimMode: false,
                previewFeatures: false,
            },
            security: {
                auth: {
                    selectedType: 'gemini-api-key',
                },
                folderTrust: {
                    enabled: true,
                },
            },
            tools: {
                useRipgrep: true,
                shell: {
                    showColor: true,
                    enableInteractiveShell: true,
                },
                truncateToolOutputLines: 100,
            },
            experimental: {
                useModelRouter: false,
                enableSubagents: false,
                codebaseInvestigatorSettings: {
                    enabled: true,
                },
            },
            ui: {
                accessibility: {
                    screenReader: false,
                },
                showMemoryUsage: true,
                showStatusInTitle: true,
                showCitations: true,
                useInkScrolling: true,
                footer: {
                    hideContextPercentage: false,
                    hideModelInfo: false,
                },
            },
            useWriteTodos: true,
            output: {
                format: 'text',
            },
            model: {
                compressionThreshold: 0.8,
            },
        };
        fs.readFileSync.mockImplementation((p) => {
            if (p === USER_SETTINGS_PATH)
                return JSON.stringify(problemSettingsContent);
            return '{}';
        });
        const settings = loadSettings(MOCK_WORKSPACE_DIR);
        // If it doesn't throw, check if it merged correctly.
        // The model.compressionThreshold should be present.
        // And model.name should probably be undefined or default, but certainly NOT { compressionThreshold: 0.8 }
        expect(settings.merged.model?.compressionThreshold).toBe(0.8);
        expect(typeof settings.merged.model?.name).not.toBe('object');
    });
});
//# sourceMappingURL=settings_repro.test.js.map