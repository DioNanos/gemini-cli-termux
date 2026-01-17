/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach, afterEach, } from 'vitest';
import { handleInstall, installCommand } from './install.js';
import yargs from 'yargs';
import { debugLogger } from '@google/gemini-cli-core';
const mockInstallOrUpdateExtension = vi.hoisted(() => vi.fn());
const mockRequestConsentNonInteractive = vi.hoisted(() => vi.fn());
const mockStat = vi.hoisted(() => vi.fn());
const mockInferInstallMetadata = vi.hoisted(() => vi.fn());
vi.mock('../../config/extensions/consent.js', () => ({
    requestConsentNonInteractive: mockRequestConsentNonInteractive,
}));
vi.mock('../../config/extension-manager.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        ExtensionManager: vi.fn().mockImplementation(() => ({
            installOrUpdateExtension: mockInstallOrUpdateExtension,
            loadExtensions: vi.fn(),
        })),
        inferInstallMetadata: mockInferInstallMetadata,
    };
});
vi.mock('../../utils/errors.js', () => ({
    getErrorMessage: vi.fn((error) => error.message),
}));
vi.mock('node:fs/promises', () => ({
    stat: mockStat,
    default: {
        stat: mockStat,
    },
}));
vi.mock('../utils.js', () => ({
    exitCli: vi.fn(),
}));
describe('extensions install command', () => {
    it('should fail if no source is provided', () => {
        const validationParser = yargs([]).command(installCommand).fail(false);
        expect(() => validationParser.parse('install')).toThrow('Not enough non-option arguments: got 0, need at least 1');
    });
});
describe('handleInstall', () => {
    let debugLogSpy;
    let debugErrorSpy;
    let processSpy;
    beforeEach(() => {
        debugLogSpy = vi.spyOn(debugLogger, 'log');
        debugErrorSpy = vi.spyOn(debugLogger, 'error');
        processSpy = vi
            .spyOn(process, 'exit')
            .mockImplementation(() => undefined);
        mockInferInstallMetadata.mockImplementation(async (source, args) => {
            if (source.startsWith('http://') ||
                source.startsWith('https://') ||
                source.startsWith('git@') ||
                source.startsWith('sso://')) {
                return {
                    source,
                    type: 'git',
                    ref: args?.ref,
                    autoUpdate: args?.autoUpdate,
                    allowPreRelease: args?.allowPreRelease,
                };
            }
            return { source, type: 'local' };
        });
    });
    afterEach(() => {
        mockInstallOrUpdateExtension.mockClear();
        mockRequestConsentNonInteractive.mockClear();
        mockStat.mockClear();
        mockInferInstallMetadata.mockClear();
        vi.clearAllMocks();
    });
    it('should install an extension from a http source', async () => {
        mockInstallOrUpdateExtension.mockResolvedValue({
            name: 'http-extension',
        });
        await handleInstall({
            source: 'http://google.com',
        });
        expect(debugLogSpy).toHaveBeenCalledWith('Extension "http-extension" installed successfully and enabled.');
    });
    it('should install an extension from a https source', async () => {
        mockInstallOrUpdateExtension.mockResolvedValue({
            name: 'https-extension',
        });
        await handleInstall({
            source: 'https://google.com',
        });
        expect(debugLogSpy).toHaveBeenCalledWith('Extension "https-extension" installed successfully and enabled.');
    });
    it('should install an extension from a git source', async () => {
        mockInstallOrUpdateExtension.mockResolvedValue({
            name: 'git-extension',
        });
        await handleInstall({
            source: 'git@some-url',
        });
        expect(debugLogSpy).toHaveBeenCalledWith('Extension "git-extension" installed successfully and enabled.');
    });
    it('throws an error from an unknown source', async () => {
        mockInferInstallMetadata.mockRejectedValue(new Error('Install source not found.'));
        await handleInstall({
            source: 'test://google.com',
        });
        expect(debugErrorSpy).toHaveBeenCalledWith('Install source not found.');
        expect(processSpy).toHaveBeenCalledWith(1);
    });
    it('should install an extension from a sso source', async () => {
        mockInstallOrUpdateExtension.mockResolvedValue({
            name: 'sso-extension',
        });
        await handleInstall({
            source: 'sso://google.com',
        });
        expect(debugLogSpy).toHaveBeenCalledWith('Extension "sso-extension" installed successfully and enabled.');
    });
    it('should install an extension from a local path', async () => {
        mockInstallOrUpdateExtension.mockResolvedValue({
            name: 'local-extension',
        });
        mockStat.mockResolvedValue({});
        await handleInstall({
            source: '/some/path',
        });
        expect(debugLogSpy).toHaveBeenCalledWith('Extension "local-extension" installed successfully and enabled.');
    });
    it('should throw an error if install extension fails', async () => {
        mockInstallOrUpdateExtension.mockRejectedValue(new Error('Install extension failed'));
        await handleInstall({ source: 'git@some-url' });
        expect(debugErrorSpy).toHaveBeenCalledWith('Install extension failed');
        expect(processSpy).toHaveBeenCalledWith(1);
    });
});
//# sourceMappingURL=install.test.js.map