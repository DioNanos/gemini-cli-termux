import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '../../test-utils/render.js';
import { waitFor } from '../../test-utils/async.js';
import { useIncludeDirsTrust } from './useIncludeDirsTrust.js';
import * as trustedFolders from '../../config/trustedFolders.js';
vi.mock('../utils/directoryUtils.js', () => ({
    expandHomeDir: (p) => p, // Simple pass-through for testing
    loadMemoryFromDirectories: vi.fn().mockResolvedValue({ fileCount: 1 }),
}));
vi.mock('../components/MultiFolderTrustDialog.js', () => ({
    MultiFolderTrustDialog: (props) => (_jsx("div", { "data-testid": "mock-dialog", children: JSON.stringify(props.folders) })),
}));
describe('useIncludeDirsTrust', () => {
    let mockConfig;
    let mockHistoryManager;
    let mockSetCustomDialog;
    let mockWorkspaceContext;
    beforeEach(() => {
        vi.clearAllMocks();
        mockWorkspaceContext = {
            addDirectory: vi.fn(),
            getDirectories: vi.fn().mockReturnValue([]),
            onDirectoriesChangedListeners: new Set(),
            onDirectoriesChanged: vi.fn(),
            notifyDirectoriesChanged: vi.fn(),
            resolveAndValidateDir: vi.fn(),
            getInitialDirectories: vi.fn(),
            setDirectories: vi.fn(),
            isPathWithinWorkspace: vi.fn(),
            fullyResolvedPath: vi.fn(),
            isPathWithinRoot: vi.fn(),
            isFileSymlink: vi.fn(),
        };
        mockConfig = {
            getPendingIncludeDirectories: vi.fn().mockReturnValue([]),
            clearPendingIncludeDirectories: vi.fn(),
            getFolderTrust: vi.fn().mockReturnValue(true),
            getWorkspaceContext: () => mockWorkspaceContext,
            getGeminiClient: vi
                .fn()
                .mockReturnValue({ addDirectoryContext: vi.fn() }),
        };
        mockHistoryManager = {
            addItem: vi.fn(),
            history: [],
            updateItem: vi.fn(),
            clearItems: vi.fn(),
            loadHistory: vi.fn(),
        };
        mockSetCustomDialog = vi.fn();
    });
    const renderTestHook = (isTrustedFolder) => {
        renderHook(() => useIncludeDirsTrust(mockConfig, isTrustedFolder, mockHistoryManager, mockSetCustomDialog));
    };
    it('should do nothing if isTrustedFolder is undefined', () => {
        vi.mocked(mockConfig.getPendingIncludeDirectories).mockReturnValue([
            '/foo',
        ]);
        renderTestHook(undefined);
        expect(mockConfig.clearPendingIncludeDirectories).not.toHaveBeenCalled();
    });
    it('should do nothing if there are no pending directories', () => {
        renderTestHook(true);
        expect(mockConfig.clearPendingIncludeDirectories).not.toHaveBeenCalled();
    });
    describe('when folder trust is disabled or workspace is untrusted', () => {
        it.each([
            { trustEnabled: false, isTrusted: true, scenario: 'trust is disabled' },
            {
                trustEnabled: true,
                isTrusted: false,
                scenario: 'workspace is untrusted',
            },
        ])('should add directories directly when $scenario', async ({ trustEnabled, isTrusted }) => {
            vi.mocked(mockConfig.getFolderTrust).mockReturnValue(trustEnabled);
            vi.mocked(mockConfig.getPendingIncludeDirectories).mockReturnValue([
                '/dir1',
                '/dir2',
            ]);
            vi.mocked(mockWorkspaceContext.addDirectory).mockImplementation((path) => {
                if (path === '/dir2') {
                    throw new Error('Test error');
                }
            });
            renderTestHook(isTrusted);
            await waitFor(() => {
                expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith('/dir1');
                expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith('/dir2');
                expect(mockHistoryManager.addItem).toHaveBeenCalledWith(expect.objectContaining({
                    text: expect.stringContaining("Error adding '/dir2': Test error"),
                }));
                expect(mockConfig.clearPendingIncludeDirectories).toHaveBeenCalledTimes(1);
            });
        });
    });
    describe('when folder trust is enabled and workspace is trusted', () => {
        let mockIsPathTrusted;
        beforeEach(() => {
            vi.spyOn(mockConfig, 'getFolderTrust').mockReturnValue(true);
            mockIsPathTrusted = vi.fn();
            const mockLoadedFolders = {
                isPathTrusted: mockIsPathTrusted,
            };
            vi.spyOn(trustedFolders, 'loadTrustedFolders').mockReturnValue(mockLoadedFolders);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it('should add trusted dirs, collect untrusted errors, and open dialog for undefined', async () => {
            const pendingDirs = ['/trusted', '/untrusted', '/undefined'];
            vi.mocked(mockConfig.getPendingIncludeDirectories).mockReturnValue(pendingDirs);
            mockIsPathTrusted.mockImplementation((path) => {
                if (path === '/trusted')
                    return true;
                if (path === '/untrusted')
                    return false;
                return undefined;
            });
            renderTestHook(true);
            // Opens dialog for undefined trust dir
            expect(mockSetCustomDialog).toHaveBeenCalledTimes(1);
            const customDialogAction = mockSetCustomDialog.mock.calls[0][0];
            expect(customDialogAction).toBeDefined();
            const dialogProps = customDialogAction.props;
            expect(dialogProps.folders).toEqual(['/undefined']);
            expect(dialogProps.trustedDirs).toEqual(['/trusted']);
            expect(dialogProps.errors).toEqual([
                `The following directories are explicitly untrusted and cannot be added to a trusted workspace:\n- /untrusted\nPlease use the permissions command to modify their trust level.`,
            ]);
        });
        it('should only add directories and clear pending if no dialog is needed', async () => {
            const pendingDirs = ['/trusted1', '/trusted2'];
            vi.mocked(mockConfig.getPendingIncludeDirectories).mockReturnValue(pendingDirs);
            mockIsPathTrusted.mockReturnValue(true);
            renderTestHook(true);
            await waitFor(() => {
                expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith('/trusted1');
                expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith('/trusted2');
                expect(mockSetCustomDialog).not.toHaveBeenCalled();
                expect(mockConfig.clearPendingIncludeDirectories).toHaveBeenCalledTimes(1);
            });
        });
    });
});
//# sourceMappingURL=useIncludeDirsTrust.test.js.map