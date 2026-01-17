/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { debugLogger } from '@google/gemini-cli-core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import semver from 'semver';
import { getErrorMessage } from '../../utils/errors.js';
import { ExtensionManager } from '../../config/extension-manager.js';
import { requestConsentNonInteractive } from '../../config/extensions/consent.js';
import { promptForSetting } from '../../config/extensions/extensionSettings.js';
import { loadSettings } from '../../config/settings.js';
import { exitCli } from '../utils.js';
export async function handleValidate(args) {
    try {
        await validateExtension(args);
        debugLogger.log(`Extension ${args.path} has been successfully validated.`);
    }
    catch (error) {
        debugLogger.error(getErrorMessage(error));
        process.exit(1);
    }
}
async function validateExtension(args) {
    const workspaceDir = process.cwd();
    const extensionManager = new ExtensionManager({
        workspaceDir,
        requestConsent: requestConsentNonInteractive,
        requestSetting: promptForSetting,
        settings: loadSettings(workspaceDir).merged,
    });
    const absoluteInputPath = path.resolve(args.path);
    const extensionConfig = await extensionManager.loadExtensionConfig(absoluteInputPath);
    const warnings = [];
    const errors = [];
    if (extensionConfig.contextFileName) {
        const contextFileNames = Array.isArray(extensionConfig.contextFileName)
            ? extensionConfig.contextFileName
            : [extensionConfig.contextFileName];
        const missingContextFiles = [];
        for (const contextFilePath of contextFileNames) {
            const contextFileAbsolutePath = path.resolve(absoluteInputPath, contextFilePath);
            if (!fs.existsSync(contextFileAbsolutePath)) {
                missingContextFiles.push(contextFilePath);
            }
        }
        if (missingContextFiles.length > 0) {
            errors.push(`The following context files referenced in gemini-extension.json are missing: ${missingContextFiles}`);
        }
    }
    if (!semver.valid(extensionConfig.version)) {
        warnings.push(`Warning: Version '${extensionConfig.version}' does not appear to be standard semver (e.g., 1.0.0).`);
    }
    if (warnings.length > 0) {
        debugLogger.warn('Validation warnings:');
        for (const warning of warnings) {
            debugLogger.warn(`  - ${warning}`);
        }
    }
    if (errors.length > 0) {
        debugLogger.error('Validation failed with the following errors:');
        for (const error of errors) {
            debugLogger.error(`  - ${error}`);
        }
        throw new Error('Extension validation failed.');
    }
}
export const validateCommand = {
    command: 'validate <path>',
    describe: 'Validates an extension from a local path.',
    builder: (yargs) => yargs.positional('path', {
        describe: 'The path of the extension to validate.',
        type: 'string',
        demandOption: true,
    }),
    handler: async (args) => {
        await handleValidate({
            path: args['path'],
        });
        await exitCli();
    },
};
//# sourceMappingURL=validate.js.map