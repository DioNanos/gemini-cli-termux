/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CommandModule } from 'yargs';
interface ConfigureArgs {
    name?: string;
    setting?: string;
    scope: string;
}
export declare const configureCommand: CommandModule<object, ConfigureArgs>;
export {};
