/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { EXTENSION_SETTINGS_FILENAME, EXTENSIONS_CONFIG_FILENAME, } from './variables.js';
import { Storage, homedir } from '@google/gemini-cli-core';
export class ExtensionStorage {
    extensionName;
    constructor(extensionName) {
        this.extensionName = extensionName;
    }
    getExtensionDir() {
        return path.join(ExtensionStorage.getUserExtensionsDir(), this.extensionName);
    }
    getConfigPath() {
        return path.join(this.getExtensionDir(), EXTENSIONS_CONFIG_FILENAME);
    }
    getEnvFilePath() {
        return path.join(this.getExtensionDir(), EXTENSION_SETTINGS_FILENAME);
    }
    static getUserExtensionsDir() {
        return new Storage(homedir()).getExtensionsDir();
    }
    static async createTmpDir() {
        return fs.promises.mkdtemp(path.join(os.tmpdir(), 'gemini-extension'));
    }
}
//# sourceMappingURL=storage.js.map