/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { getMissingSettings } from './extensionSettings.js';
import { ExtensionStorage } from './storage.js';
import { KeychainTokenStorage, debugLogger, coreEvents, } from '@google/gemini-cli-core';
import { EXTENSION_SETTINGS_FILENAME } from './variables.js';
import { ExtensionManager } from '../extension-manager.js';
import { createTestMergedSettings } from '../settings.js';
vi.mock('node:fs', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await importOriginal();
    return {
        ...actual,
        default: {
            ...actual.default,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existsSync: vi.fn((...args) => actual.existsSync(...args)),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        existsSync: vi.fn((...args) => actual.existsSync(...args)),
    };
});
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        KeychainTokenStorage: vi.fn(),
        debugLogger: {
            warn: vi.fn(),
            error: vi.fn(),
            log: vi.fn(),
        },
        coreEvents: {
            emitFeedback: vi.fn(), // Mock emitFeedback
            on: vi.fn(),
            off: vi.fn(),
        },
    };
});
// Mock os.homedir because ExtensionStorage uses it
vi.mock('os', async (importOriginal) => {
    const mockedOs = await importOriginal();
    return {
        ...mockedOs,
        homedir: vi.fn(),
    };
});
describe('extensionUpdates', () => {
    let tempHomeDir;
    let tempWorkspaceDir;
    let extensionDir;
    let mockKeychainData;
    beforeEach(() => {
        vi.clearAllMocks();
        mockKeychainData = {};
        // Mock Keychain
        vi.mocked(KeychainTokenStorage).mockImplementation((serviceName) => {
            if (!mockKeychainData[serviceName]) {
                mockKeychainData[serviceName] = {};
            }
            const keychainData = mockKeychainData[serviceName];
            return {
                getSecret: vi
                    .fn()
                    .mockImplementation(async (key) => keychainData[key] || null),
                setSecret: vi
                    .fn()
                    .mockImplementation(async (key, value) => {
                    keychainData[key] = value;
                }),
                deleteSecret: vi.fn().mockImplementation(async (key) => {
                    delete keychainData[key];
                }),
                listSecrets: vi
                    .fn()
                    .mockImplementation(async () => Object.keys(keychainData)),
                isAvailable: vi.fn().mockResolvedValue(true),
            };
        });
        // Setup Temp Dirs
        tempHomeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-cli-test-home-'));
        tempWorkspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-cli-test-workspace-'));
        extensionDir = path.join(tempHomeDir, '.gemini', 'extensions', 'test-ext');
        // Mock ExtensionStorage to rely on our temp extension dir
        vi.spyOn(ExtensionStorage.prototype, 'getExtensionDir').mockReturnValue(extensionDir);
        // Mock getEnvFilePath is checking extensionDir/variables.env? No, it used ExtensionStorage logic.
        // getEnvFilePath in extensionSettings.ts:
        // if workspace, process.cwd()/.env (we need to mock process.cwd or move tempWorkspaceDir there)
        // if user, ExtensionStorage(name).getEnvFilePath() -> joins extensionDir + '.env'
        fs.mkdirSync(extensionDir, { recursive: true });
        vi.mocked(os.homedir).mockReturnValue(tempHomeDir);
        vi.spyOn(process, 'cwd').mockReturnValue(tempWorkspaceDir);
    });
    afterEach(() => {
        fs.rmSync(tempHomeDir, { recursive: true, force: true });
        fs.rmSync(tempWorkspaceDir, { recursive: true, force: true });
        vi.restoreAllMocks();
    });
    describe('getMissingSettings', () => {
        it('should return empty list if all settings are present', async () => {
            const config = {
                name: 'test-ext',
                version: '1.0.0',
                settings: [
                    { name: 's1', description: 'd1', envVar: 'VAR1' },
                    { name: 's2', description: 'd2', envVar: 'VAR2', sensitive: true },
                ],
            };
            const extensionId = '12345';
            // Setup User Env
            const userEnvPath = path.join(extensionDir, EXTENSION_SETTINGS_FILENAME);
            fs.writeFileSync(userEnvPath, 'VAR1=val1');
            // Setup Keychain
            const userKeychain = new KeychainTokenStorage(`Gemini CLI Extensions test-ext ${extensionId}`);
            await userKeychain.setSecret('VAR2', 'val2');
            const missing = await getMissingSettings(config, extensionId, tempWorkspaceDir);
            expect(missing).toEqual([]);
        });
        it('should identify missing non-sensitive settings', async () => {
            const config = {
                name: 'test-ext',
                version: '1.0.0',
                settings: [{ name: 's1', description: 'd1', envVar: 'VAR1' }],
            };
            const extensionId = '12345';
            const missing = await getMissingSettings(config, extensionId, tempWorkspaceDir);
            expect(missing).toHaveLength(1);
            expect(missing[0].name).toBe('s1');
        });
        it('should identify missing sensitive settings', async () => {
            const config = {
                name: 'test-ext',
                version: '1.0.0',
                settings: [
                    { name: 's2', description: 'd2', envVar: 'VAR2', sensitive: true },
                ],
            };
            const extensionId = '12345';
            const missing = await getMissingSettings(config, extensionId, tempWorkspaceDir);
            expect(missing).toHaveLength(1);
            expect(missing[0].name).toBe('s2');
        });
        it('should respect settings present in workspace', async () => {
            const config = {
                name: 'test-ext',
                version: '1.0.0',
                settings: [{ name: 's1', description: 'd1', envVar: 'VAR1' }],
            };
            const extensionId = '12345';
            // Setup Workspace Env
            const workspaceEnvPath = path.join(tempWorkspaceDir, EXTENSION_SETTINGS_FILENAME);
            fs.writeFileSync(workspaceEnvPath, 'VAR1=val1');
            const missing = await getMissingSettings(config, extensionId, tempWorkspaceDir);
            expect(missing).toEqual([]);
        });
    });
    describe('ExtensionManager integration', () => {
        it('should warn about missing settings after update', async () => {
            // Mock ExtensionManager methods to avoid FS/Network usage
            const newConfig = {
                name: 'test-ext',
                version: '1.1.0',
                settings: [{ name: 's1', description: 'd1', envVar: 'VAR1' }],
            };
            const previousConfig = {
                name: 'test-ext',
                version: '1.0.0',
                settings: [],
            };
            const installMetadata = {
                source: extensionDir,
                type: 'local',
                autoUpdate: true,
            };
            const manager = new ExtensionManager({
                workspaceDir: tempWorkspaceDir,
                settings: createTestMergedSettings({
                    telemetry: { enabled: false },
                    experimental: { extensionConfig: true },
                }),
                requestConsent: vi.fn().mockResolvedValue(true),
                requestSetting: null, // Simulate non-interactive
            });
            // Mock methods called by installOrUpdateExtension
            vi.spyOn(manager, 'loadExtensionConfig').mockResolvedValue(newConfig);
            vi.spyOn(manager, 'getExtensions').mockReturnValue([
                {
                    name: 'test-ext',
                    version: '1.0.0',
                    installMetadata,
                    path: extensionDir,
                    // Mocks for other required props
                    contextFiles: [],
                    mcpServers: {},
                    hooks: undefined,
                    isActive: true,
                    id: 'test-id',
                    settings: [],
                    resolvedSettings: [],
                    skills: [],
                },
            ]);
            vi.spyOn(manager, 'uninstallExtension').mockResolvedValue(undefined);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.spyOn(manager, 'loadExtension').mockResolvedValue({});
            vi.spyOn(manager, 'enableExtension').mockResolvedValue(undefined);
            // Mock fs.promises for the operations inside installOrUpdateExtension
            vi.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
            vi.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
            vi.spyOn(fs.promises, 'rm').mockResolvedValue(undefined);
            vi.mocked(fs.existsSync).mockReturnValue(false); // No hooks
            try {
                await manager.installOrUpdateExtension(installMetadata, previousConfig);
            }
            catch (_) {
                // Ignore errors from copyExtension or others, we just want to verify the warning
            }
            expect(debugLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Extension "test-ext" has missing settings: s1'));
            expect(coreEvents.emitFeedback).toHaveBeenCalledWith('warning', expect.stringContaining('Please run "gemini extensions config test-ext [setting-name]"'));
        });
    });
});
//# sourceMappingURL=extensionUpdates.test.js.map