/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const GOOGLE_ACCOUNTS_FILENAME = "google_accounts.json";
export declare const OAUTH_FILE = "oauth_creds.json";
export declare class Storage {
    private readonly targetDir;
    constructor(targetDir: string);
    static getGlobalGeminiDir(): string;
    static getMcpOAuthTokensPath(): string;
    static getGlobalSettingsPath(): string;
    static getInstallationIdPath(): string;
    static getGoogleAccountsPath(): string;
    static getUserCommandsDir(): string;
    static getUserSkillsDir(): string;
    static getGlobalMemoryFilePath(): string;
    static getUserPoliciesDir(): string;
    static getUserAgentsDir(): string;
    static getSystemSettingsPath(): string;
    static getSystemPoliciesDir(): string;
    static getGlobalTempDir(): string;
    static getGlobalBinDir(): string;
    getGeminiDir(): string;
    getProjectTempDir(): string;
    ensureProjectTempDirExists(): void;
    static getOAuthCredsPath(): string;
    getProjectRoot(): string;
    private getFilePathHash;
    getHistoryDir(): string;
    getWorkspaceSettingsPath(): string;
    getProjectCommandsDir(): string;
    getProjectSkillsDir(): string;
    getProjectAgentsDir(): string;
    getProjectTempCheckpointsDir(): string;
    getProjectTempLogsDir(): string;
    getExtensionsDir(): string;
    getExtensionsConfigPath(): string;
    getHistoryFilePath(): string;
}
