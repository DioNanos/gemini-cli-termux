/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import { GEMINI_DIR, homedir } from '../utils/paths.js';
export const GOOGLE_ACCOUNTS_FILENAME = 'google_accounts.json';
export const OAUTH_FILE = 'oauth_creds.json';
const TMP_DIR_NAME = 'tmp';
const BIN_DIR_NAME = 'bin';
export class Storage {
    targetDir;
    constructor(targetDir) {
        this.targetDir = targetDir;
    }
    static getGlobalGeminiDir() {
        const homeDir = homedir();
        if (!homeDir) {
            return path.join(os.tmpdir(), GEMINI_DIR);
        }
        return path.join(homeDir, GEMINI_DIR);
    }
    static getMcpOAuthTokensPath() {
        return path.join(Storage.getGlobalGeminiDir(), 'mcp-oauth-tokens.json');
    }
    static getGlobalSettingsPath() {
        return path.join(Storage.getGlobalGeminiDir(), 'settings.json');
    }
    static getInstallationIdPath() {
        return path.join(Storage.getGlobalGeminiDir(), 'installation_id');
    }
    static getGoogleAccountsPath() {
        return path.join(Storage.getGlobalGeminiDir(), GOOGLE_ACCOUNTS_FILENAME);
    }
    static getUserCommandsDir() {
        return path.join(Storage.getGlobalGeminiDir(), 'commands');
    }
    static getUserSkillsDir() {
        return path.join(Storage.getGlobalGeminiDir(), 'skills');
    }
    static getGlobalMemoryFilePath() {
        return path.join(Storage.getGlobalGeminiDir(), 'memory.md');
    }
    static getUserPoliciesDir() {
        return path.join(Storage.getGlobalGeminiDir(), 'policies');
    }
    static getUserAgentsDir() {
        return path.join(Storage.getGlobalGeminiDir(), 'agents');
    }
    static getSystemSettingsPath() {
        if (process.env['GEMINI_CLI_SYSTEM_SETTINGS_PATH']) {
            return process.env['GEMINI_CLI_SYSTEM_SETTINGS_PATH'];
        }
        if (os.platform() === 'darwin') {
            return '/Library/Application Support/GeminiCli/settings.json';
        }
        else if (os.platform() === 'win32') {
            return 'C:\\ProgramData\\gemini-cli\\settings.json';
        }
        else {
            return '/etc/gemini-cli/settings.json';
        }
    }
    static getSystemPoliciesDir() {
        return path.join(path.dirname(Storage.getSystemSettingsPath()), 'policies');
    }
    static getGlobalTempDir() {
        return path.join(Storage.getGlobalGeminiDir(), TMP_DIR_NAME);
    }
    static getGlobalBinDir() {
        return path.join(Storage.getGlobalTempDir(), BIN_DIR_NAME);
    }
    getGeminiDir() {
        return path.join(this.targetDir, GEMINI_DIR);
    }
    getProjectTempDir() {
        const hash = this.getFilePathHash(this.getProjectRoot());
        const tempDir = Storage.getGlobalTempDir();
        return path.join(tempDir, hash);
    }
    ensureProjectTempDirExists() {
        fs.mkdirSync(this.getProjectTempDir(), { recursive: true });
    }
    static getOAuthCredsPath() {
        return path.join(Storage.getGlobalGeminiDir(), OAUTH_FILE);
    }
    getProjectRoot() {
        return this.targetDir;
    }
    getFilePathHash(filePath) {
        return crypto.createHash('sha256').update(filePath).digest('hex');
    }
    getHistoryDir() {
        const hash = this.getFilePathHash(this.getProjectRoot());
        const historyDir = path.join(Storage.getGlobalGeminiDir(), 'history');
        return path.join(historyDir, hash);
    }
    getWorkspaceSettingsPath() {
        return path.join(this.getGeminiDir(), 'settings.json');
    }
    getProjectCommandsDir() {
        return path.join(this.getGeminiDir(), 'commands');
    }
    getProjectSkillsDir() {
        return path.join(this.getGeminiDir(), 'skills');
    }
    getProjectAgentsDir() {
        return path.join(this.getGeminiDir(), 'agents');
    }
    getProjectTempCheckpointsDir() {
        return path.join(this.getProjectTempDir(), 'checkpoints');
    }
    getProjectTempLogsDir() {
        return path.join(this.getProjectTempDir(), 'logs');
    }
    getExtensionsDir() {
        return path.join(this.getGeminiDir(), 'extensions');
    }
    getExtensionsConfigPath() {
        return path.join(this.getExtensionsDir(), 'gemini-extension.json');
    }
    getHistoryFilePath() {
        return path.join(this.getProjectTempDir(), 'shell_history');
    }
}
//# sourceMappingURL=storage.js.map