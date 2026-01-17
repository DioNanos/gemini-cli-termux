/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MemoryCommand } from './memory.js';
import { debugLogger } from '@google/gemini-cli-core';
import { ExtensionsCommand } from './extensions.js';
import { InitCommand } from './init.js';
import { RestoreCommand } from './restore.js';
export class CommandRegistry {
    commands = new Map();
    constructor() {
        this.initialize();
    }
    initialize() {
        this.commands.clear();
        this.register(new ExtensionsCommand());
        this.register(new RestoreCommand());
        this.register(new InitCommand());
        this.register(new MemoryCommand());
    }
    register(command) {
        if (this.commands.has(command.name)) {
            debugLogger.warn(`Command ${command.name} already registered. Skipping.`);
            return;
        }
        this.commands.set(command.name, command);
        for (const subCommand of command.subCommands ?? []) {
            this.register(subCommand);
        }
    }
    get(commandName) {
        return this.commands.get(commandName);
    }
    getAllCommands() {
        return [...this.commands.values()];
    }
}
export const commandRegistry = new CommandRegistry();
//# sourceMappingURL=command-registry.js.map