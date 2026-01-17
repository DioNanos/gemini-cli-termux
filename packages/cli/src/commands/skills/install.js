/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { debugLogger } from '@google/gemini-cli-core';
import { getErrorMessage } from '../../utils/errors.js';
import { exitCli } from '../utils.js';
import { installSkill } from '../../utils/skillUtils.js';
import chalk from 'chalk';
import { requestConsentNonInteractive, skillsConsentString, } from '../../config/extensions/consent.js';
export async function handleInstall(args) {
    try {
        const { source, consent } = args;
        const scope = args.scope ?? 'user';
        const subpath = args.path;
        const requestConsent = async (skills, targetDir) => {
            if (consent) {
                debugLogger.log('You have consented to the following:');
                debugLogger.log(await skillsConsentString(skills, source, targetDir));
                return true;
            }
            return requestConsentNonInteractive(await skillsConsentString(skills, source, targetDir));
        };
        const installedSkills = await installSkill(source, scope, subpath, (msg) => {
            debugLogger.log(msg);
        }, requestConsent);
        for (const skill of installedSkills) {
            debugLogger.log(chalk.green(`Successfully installed skill: ${chalk.bold(skill.name)} (scope: ${scope}, location: ${skill.location})`));
        }
    }
    catch (error) {
        debugLogger.error(getErrorMessage(error));
        await exitCli(1);
    }
}
export const installCommand = {
    command: 'install <source> [--scope] [--path]',
    describe: 'Installs an agent skill from a git repository URL or a local path.',
    builder: (yargs) => yargs
        .positional('source', {
        describe: 'The git repository URL or local path of the skill to install.',
        type: 'string',
        demandOption: true,
    })
        .option('scope', {
        describe: 'The scope to install the skill into. Defaults to "user" (global).',
        choices: ['user', 'workspace'],
        default: 'user',
    })
        .option('path', {
        describe: 'Sub-path within the repository to install from (only used for git repository sources).',
        type: 'string',
    })
        .option('consent', {
        describe: 'Acknowledge the security risks of installing a skill and skip the confirmation prompt.',
        type: 'boolean',
        default: false,
    })
        .check((argv) => {
        if (!argv.source) {
            throw new Error('The source argument must be provided.');
        }
        return true;
    }),
    handler: async (argv) => {
        await handleInstall({
            source: argv['source'],
            scope: argv['scope'],
            path: argv['path'],
            consent: argv['consent'],
        });
        await exitCli();
    },
};
//# sourceMappingURL=install.js.map