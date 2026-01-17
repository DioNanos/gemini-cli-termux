/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
interface EnableArgs {
    name: string;
}
export declare function handleEnable(args: EnableArgs): Promise<void>;
export declare const enableCommand: CommandModule;
export {};
