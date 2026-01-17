/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
export declare function handleList(args: {
    all?: boolean;
}): Promise<void>;
export declare const listCommand: CommandModule;
