/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { listExtensions } from '@google/gemini-cli-core';
export class ExtensionsCommand {
    name = 'extensions';
    description = 'Manage extensions.';
    subCommands = [new ListExtensionsCommand()];
    topLevel = true;
    async execute(context, _) {
        return new ListExtensionsCommand().execute(context, _);
    }
}
export class ListExtensionsCommand {
    name = 'extensions list';
    description = 'Lists all installed extensions.';
    async execute(context, _) {
        const extensions = listExtensions(context.config);
        const data = extensions.length ? extensions : 'No extensions installed.';
        return { name: this.name, data };
    }
}
//# sourceMappingURL=extensions.js.map