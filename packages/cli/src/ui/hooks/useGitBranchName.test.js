import { jsx as _jsx } from "react/jsx-runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { render } from '../../test-utils/render.js';
import { waitFor } from '../../test-utils/async.js';
import { useGitBranchName } from './useGitBranchName.js';
import { fs, vol } from 'memfs';
import * as fsPromises from 'node:fs/promises';
import path from 'node:path'; // For mocking fs
import { spawnAsync as mockSpawnAsync } from '@google/gemini-cli-core';
// Mock @google/gemini-cli-core
vi.mock('@google/gemini-cli-core', async () => {
    const original = await vi.importActual('@google/gemini-cli-core');
    return {
        ...original,
        spawnAsync: vi.fn(),
    };
});
// Mock fs and fs/promises
vi.mock('node:fs', async () => {
    const memfs = await vi.importActual('memfs');
    return {
        ...memfs.fs,
        default: memfs.fs,
    };
});
vi.mock('node:fs/promises', async () => {
    const memfs = await vi.importActual('memfs');
    return { ...memfs.fs.promises, default: memfs.fs.promises };
});
const CWD = '/test/project';
const GIT_LOGS_HEAD_PATH = path.join(CWD, '.git', 'logs', 'HEAD');
describe('useGitBranchName', () => {
    beforeEach(() => {
        vol.reset(); // Reset in-memory filesystem
        vol.fromJSON({
            [GIT_LOGS_HEAD_PATH]: 'ref: refs/heads/main',
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    const renderGitBranchNameHook = (cwd) => {
        let hookResult;
        function TestComponent() {
            hookResult = useGitBranchName(cwd);
            return null;
        }
        const { rerender, unmount } = render(_jsx(TestComponent, {}));
        return {
            result: {
                get current() {
                    return hookResult;
                },
            },
            rerender: () => rerender(_jsx(TestComponent, {})),
            unmount,
        };
    };
    it('should return branch name', async () => {
        mockSpawnAsync.mockResolvedValue({
            stdout: 'main\n',
        });
        const { result, rerender } = renderGitBranchNameHook(CWD);
        await act(async () => {
            rerender(); // Rerender to get the updated state
        });
        expect(result.current).toBe('main');
    });
    it('should return undefined if git command fails', async () => {
        mockSpawnAsync.mockRejectedValue(new Error('Git error'));
        const { result, rerender } = renderGitBranchNameHook(CWD);
        expect(result.current).toBeUndefined();
        await act(async () => {
            rerender();
        });
        expect(result.current).toBeUndefined();
    });
    it('should return short commit hash if branch is HEAD (detached state)', async () => {
        mockSpawnAsync.mockImplementation(async (command, args) => {
            if (args.includes('--abbrev-ref')) {
                return { stdout: 'HEAD\n' };
            }
            else if (args.includes('--short')) {
                return { stdout: 'a1b2c3d\n' };
            }
            return { stdout: '' };
        });
        const { result, rerender } = renderGitBranchNameHook(CWD);
        await act(async () => {
            rerender();
        });
        expect(result.current).toBe('a1b2c3d');
    });
    it('should return undefined if branch is HEAD and getting commit hash fails', async () => {
        mockSpawnAsync.mockImplementation(async (command, args) => {
            if (args.includes('--abbrev-ref')) {
                return { stdout: 'HEAD\n' };
            }
            else if (args.includes('--short')) {
                throw new Error('Git error');
            }
            return { stdout: '' };
        });
        const { result, rerender } = renderGitBranchNameHook(CWD);
        await act(async () => {
            rerender();
        });
        expect(result.current).toBeUndefined();
    });
    it('should update branch name when .git/HEAD changes', async () => {
        vi.spyOn(fsPromises, 'access').mockResolvedValue(undefined);
        const watchSpy = vi.spyOn(fs, 'watch');
        mockSpawnAsync
            .mockResolvedValueOnce({ stdout: 'main\n' })
            .mockResolvedValue({ stdout: 'develop\n' });
        const { result, rerender } = renderGitBranchNameHook(CWD);
        await act(async () => {
            rerender();
        });
        expect(result.current).toBe('main');
        // Wait for watcher to be set up
        await waitFor(() => {
            expect(watchSpy).toHaveBeenCalled();
        });
        // Simulate file change event
        await act(async () => {
            fs.writeFileSync(GIT_LOGS_HEAD_PATH, 'ref: refs/heads/develop'); // Trigger watcher
            rerender();
        });
        await waitFor(() => {
            expect(result.current).toBe('develop');
        });
    });
    it('should handle watcher setup error silently', async () => {
        // Remove .git/logs/HEAD to cause an error in fs.watch setup
        vol.unlinkSync(GIT_LOGS_HEAD_PATH);
        mockSpawnAsync.mockResolvedValue({
            stdout: 'main\n',
        });
        const { result, rerender } = renderGitBranchNameHook(CWD);
        await act(async () => {
            rerender();
        });
        expect(result.current).toBe('main'); // Branch name should still be fetched initially
        mockSpawnAsync.mockResolvedValueOnce({
            stdout: 'develop\n',
        });
        // This write would trigger the watcher if it was set up
        // but since it failed, the branch name should not update
        // We need to create the file again for writeFileSync to not throw
        vol.fromJSON({
            [GIT_LOGS_HEAD_PATH]: 'ref: refs/heads/develop',
        });
        await act(async () => {
            fs.writeFileSync(GIT_LOGS_HEAD_PATH, 'ref: refs/heads/develop');
            rerender();
        });
        // Branch name should not change because watcher setup failed
        expect(result.current).toBe('main');
    });
    it('should cleanup watcher on unmount', async () => {
        vi.spyOn(fsPromises, 'access').mockResolvedValue(undefined);
        const closeMock = vi.fn();
        const watchMock = vi.spyOn(fs, 'watch').mockReturnValue({
            close: closeMock,
        });
        mockSpawnAsync.mockResolvedValue({
            stdout: 'main\n',
        });
        const { unmount, rerender } = renderGitBranchNameHook(CWD);
        await act(async () => {
            rerender();
        });
        // Wait for watcher to be set up BEFORE unmounting
        await waitFor(() => {
            expect(watchMock).toHaveBeenCalledWith(GIT_LOGS_HEAD_PATH, expect.any(Function));
        });
        unmount();
        expect(closeMock).toHaveBeenCalled();
    });
});
//# sourceMappingURL=useGitBranchName.test.js.map