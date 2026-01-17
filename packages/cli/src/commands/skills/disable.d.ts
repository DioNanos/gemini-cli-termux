/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
import { SettingScope } from '../../config/settings.js';
interface DisableArgs {
    name: string;
    scope: SettingScope;
}
export declare function handleDisable(args: DisableArgs): Promise<void>;
export declare const disableCommand: CommandModule;
export {};
