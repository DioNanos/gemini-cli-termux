/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
interface UninstallArgs {
    name: string;
    scope?: 'user' | 'workspace';
}
export declare function handleUninstall(args: UninstallArgs): Promise<void>;
export declare const uninstallCommand: CommandModule;
export {};
