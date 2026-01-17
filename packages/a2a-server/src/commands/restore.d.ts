/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Command, CommandContext, CommandExecutionResponse } from './types.js';
export declare class RestoreCommand implements Command {
    readonly name = "restore";
    readonly description = "Restore to a previous checkpoint, or list available checkpoints to restore. This will reset the conversation and file history to the state it was in when the checkpoint was created";
    readonly topLevel = true;
    readonly requiresWorkspace = true;
    readonly subCommands: ListCheckpointsCommand[];
    execute(context: CommandContext, args: string[]): Promise<CommandExecutionResponse>;
}
export declare class ListCheckpointsCommand implements Command {
    readonly name = "restore list";
    readonly description = "Lists all available checkpoints.";
    readonly topLevel = false;
    execute(context: CommandContext): Promise<CommandExecutionResponse>;
}
