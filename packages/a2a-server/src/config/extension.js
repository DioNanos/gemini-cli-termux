/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Copied exactly from packages/cli/src/config/extension.ts, last PR #1026
import { GEMINI_DIR, homedir, } from '@google/gemini-cli-core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger } from '../utils/logger.js';
export const EXTENSIONS_DIRECTORY_NAME = path.join(GEMINI_DIR, 'extensions');
export const EXTENSIONS_CONFIG_FILENAME = 'gemini-extension.json';
export const INSTALL_METADATA_FILENAME = '.gemini-extension-install.json';
export function loadExtensions(workspaceDir) {
    const allExtensions = [
        ...loadExtensionsFromDir(workspaceDir),
        ...loadExtensionsFromDir(homedir()),
    ];
    const uniqueExtensions = [];
    const seenNames = new Set();
    for (const extension of allExtensions) {
        if (!seenNames.has(extension.name)) {
            logger.info(`Loading extension: ${extension.name} (version: ${extension.version})`);
            uniqueExtensions.push(extension);
            seenNames.add(extension.name);
        }
    }
    return uniqueExtensions;
}
function loadExtensionsFromDir(dir) {
    const extensionsDir = path.join(dir, EXTENSIONS_DIRECTORY_NAME);
    if (!fs.existsSync(extensionsDir)) {
        return [];
    }
    const extensions = [];
    for (const subdir of fs.readdirSync(extensionsDir)) {
        const extensionDir = path.join(extensionsDir, subdir);
        const extension = loadExtension(extensionDir);
        if (extension != null) {
            extensions.push(extension);
        }
    }
    return extensions;
}
function loadExtension(extensionDir) {
    if (!fs.statSync(extensionDir).isDirectory()) {
        logger.error(`Warning: unexpected file ${extensionDir} in extensions directory.`);
        return null;
    }
    const configFilePath = path.join(extensionDir, EXTENSIONS_CONFIG_FILENAME);
    if (!fs.existsSync(configFilePath)) {
        logger.error(`Warning: extension directory ${extensionDir} does not contain a config file ${configFilePath}.`);
        return null;
    }
    try {
        const configContent = fs.readFileSync(configFilePath, 'utf-8');
        const config = JSON.parse(configContent);
        if (!config.name || !config.version) {
            logger.error(`Invalid extension config in ${configFilePath}: missing name or version.`);
            return null;
        }
        const installMetadata = loadInstallMetadata(extensionDir);
        const contextFiles = getContextFileNames(config)
            .map((contextFileName) => path.join(extensionDir, contextFileName))
            .filter((contextFilePath) => fs.existsSync(contextFilePath));
        return {
            name: config.name,
            version: config.version,
            path: extensionDir,
            contextFiles,
            installMetadata,
            mcpServers: config.mcpServers,
            excludeTools: config.excludeTools,
            isActive: true, // Barring any other signals extensions should be considered Active.
        };
    }
    catch (e) {
        logger.error(`Warning: error parsing extension config in ${configFilePath}: ${e}`);
        return null;
    }
}
function getContextFileNames(config) {
    if (!config.contextFileName) {
        return ['GEMINI.md'];
    }
    else if (!Array.isArray(config.contextFileName)) {
        return [config.contextFileName];
    }
    return config.contextFileName;
}
export function loadInstallMetadata(extensionDir) {
    const metadataFilePath = path.join(extensionDir, INSTALL_METADATA_FILENAME);
    try {
        const configContent = fs.readFileSync(metadataFilePath, 'utf-8');
        const metadata = JSON.parse(configContent);
        return metadata;
    }
    catch (e) {
        logger.warn(`Failed to load or parse extension install metadata at ${metadataFilePath}: ${e}`);
        return undefined;
    }
}
//# sourceMappingURL=extension.js.map