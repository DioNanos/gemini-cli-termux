/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Command } from './types.js';
export declare class CommandRegistry {
    private readonly commands;
    constructor();
    initialize(): void;
    register(command: Command): void;
    get(commandName: string): Command | undefined;
    getAllCommands(): Command[];
}
export declare const commandRegistry: CommandRegistry;
