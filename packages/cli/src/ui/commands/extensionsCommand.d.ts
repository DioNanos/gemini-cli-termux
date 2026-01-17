/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type CommandContext, type SlashCommand } from './types.js';
/**
 * Exported for testing.
 */
export declare function completeExtensions(context: CommandContext, partialArg: string): string[];
export declare function completeExtensionsAndScopes(context: CommandContext, partialArg: string): string[];
export declare function extensionsCommand(enableExtensionReloading?: boolean): SlashCommand;
