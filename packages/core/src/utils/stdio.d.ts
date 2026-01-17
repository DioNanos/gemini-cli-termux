/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Writes to the real stdout, bypassing any monkey patching on process.stdout.write.
 */
export declare function writeToStdout(...args: Parameters<typeof process.stdout.write>): boolean;
/**
 * Writes to the real stderr, bypassing any monkey patching on process.stderr.write.
 */
export declare function writeToStderr(...args: Parameters<typeof process.stderr.write>): boolean;
/**
 * Monkey patches process.stdout.write and process.stderr.write to redirect output to the provided logger.
 * This prevents stray output from libraries (or the app itself) from corrupting the UI.
 * Returns a cleanup function that restores the original write methods.
 */
export declare function patchStdio(): () => void;
/**
 * Creates proxies for process.stdout and process.stderr that use the real write methods
 * (writeToStdout and writeToStderr) bypassing any monkey patching.
 * This is used to write to the real output even when stdio is patched.
 */
export declare function createWorkingStdio(): {
    stdout: NodeJS.WriteStream & {
        fd: 1;
    };
    stderr: NodeJS.WriteStream & {
        fd: 2;
    };
};
