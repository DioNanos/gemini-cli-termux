/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
interface InstallArgs {
    path: string;
    consent?: boolean;
}
export declare function handleLink(args: InstallArgs): Promise<void>;
export declare const linkCommand: CommandModule;
export {};
