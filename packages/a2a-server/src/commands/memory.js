/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { addMemory, listMemoryFiles, refreshMemory, showMemory, } from '@google/gemini-cli-core';
const DEFAULT_SANITIZATION_CONFIG = {
    allowedEnvironmentVariables: [],
    blockedEnvironmentVariables: [],
    enableEnvironmentVariableRedaction: false,
};
export class MemoryCommand {
    name = 'memory';
    description = 'Manage memory.';
    subCommands = [
        new ShowMemoryCommand(),
        new RefreshMemoryCommand(),
        new ListMemoryCommand(),
        new AddMemoryCommand(),
    ];
    topLevel = true;
    requiresWorkspace = true;
    async execute(context, _) {
        return new ShowMemoryCommand().execute(context, _);
    }
}
export class ShowMemoryCommand {
    name = 'memory show';
    description = 'Shows the current memory contents.';
    async execute(context, _) {
        const result = showMemory(context.config);
        return { name: this.name, data: result.content };
    }
}
export class RefreshMemoryCommand {
    name = 'memory refresh';
    description = 'Refreshes the memory from the source.';
    async execute(context, _) {
        const result = await refreshMemory(context.config);
        return { name: this.name, data: result.content };
    }
}
export class ListMemoryCommand {
    name = 'memory list';
    description = 'Lists the paths of the GEMINI.md files in use.';
    async execute(context, _) {
        const result = listMemoryFiles(context.config);
        return { name: this.name, data: result.content };
    }
}
export class AddMemoryCommand {
    name = 'memory add';
    description = 'Add content to the memory.';
    async execute(context, args) {
        const textToAdd = args.join(' ').trim();
        const result = addMemory(textToAdd);
        if (result.type === 'message') {
            return { name: this.name, data: result.content };
        }
        const toolRegistry = context.config.getToolRegistry();
        const tool = toolRegistry.getTool(result.toolName);
        if (tool) {
            const abortController = new AbortController();
            const signal = abortController.signal;
            await tool.buildAndExecute(result.toolArgs, signal, undefined, {
                sanitizationConfig: DEFAULT_SANITIZATION_CONFIG,
            });
            await refreshMemory(context.config);
            return {
                name: this.name,
                data: `Added memory: "${textToAdd}"`,
            };
        }
        else {
            return {
                name: this.name,
                data: `Error: Tool ${result.toolName} not found.`,
            };
        }
    }
}
//# sourceMappingURL=memory.js.map