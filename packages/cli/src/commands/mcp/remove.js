/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { loadSettings, SettingScope } from '../../config/settings.js';
import { debugLogger } from '@google/gemini-cli-core';
import { exitCli } from '../utils.js';
async function removeMcpServer(name, options) {
    const { scope } = options;
    const settingsScope = scope === 'user' ? SettingScope.User : SettingScope.Workspace;
    const settings = loadSettings();
    const existingSettings = settings.forScope(settingsScope).settings;
    const mcpServers = existingSettings.mcpServers || {};
    if (!mcpServers[name]) {
        debugLogger.log(`Server "${name}" not found in ${scope} settings.`);
        return;
    }
    delete mcpServers[name];
    settings.setValue(settingsScope, 'mcpServers', mcpServers);
    debugLogger.log(`Server "${name}" removed from ${scope} settings.`);
}
export const removeCommand = {
    command: 'remove <name>',
    describe: 'Remove a server',
    builder: (yargs) => yargs
        .usage('Usage: gemini mcp remove [options] <name>')
        .positional('name', {
        describe: 'Name of the server',
        type: 'string',
        demandOption: true,
    })
        .option('scope', {
        alias: 's',
        describe: 'Configuration scope (user or project)',
        type: 'string',
        default: 'project',
        choices: ['user', 'project'],
    }),
    handler: async (argv) => {
        await removeMcpServer(argv['name'], {
            scope: argv['scope'],
        });
        await exitCli();
    },
};
//# sourceMappingURL=remove.js.map