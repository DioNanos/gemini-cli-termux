/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Command, CommandContext, CommandExecutionResponse } from './types.js';
export declare class ExtensionsCommand implements Command {
    readonly name = "extensions";
    readonly description = "Manage extensions.";
    readonly subCommands: ListExtensionsCommand[];
    readonly topLevel = true;
    execute(context: CommandContext, _: string[]): Promise<CommandExecutionResponse>;
}
export declare class ListExtensionsCommand implements Command {
    readonly name = "extensions list";
    readonly description = "Lists all installed extensions.";
    execute(context: CommandContext, _: string[]): Promise<CommandExecutionResponse>;
}
