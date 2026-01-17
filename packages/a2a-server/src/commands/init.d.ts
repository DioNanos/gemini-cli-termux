/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Command, CommandContext, CommandExecutionResponse } from './types.js';
export declare class InitCommand implements Command {
    name: string;
    description: string;
    requiresWorkspace: boolean;
    streaming: boolean;
    private handleMessageResult;
    private handleSubmitPromptResult;
    execute(context: CommandContext, _args?: string[]): Promise<CommandExecutionResponse>;
}
