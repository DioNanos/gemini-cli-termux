/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
interface InstallArgs {
    source: string;
    scope?: 'user' | 'workspace';
    path?: string;
    consent?: boolean;
}
export declare function handleInstall(args: InstallArgs): Promise<void>;
export declare const installCommand: CommandModule;
export {};
