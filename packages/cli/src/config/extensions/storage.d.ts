/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare class ExtensionStorage {
    private readonly extensionName;
    constructor(extensionName: string);
    getExtensionDir(): string;
    getConfigPath(): string;
    getEnvFilePath(): string;
    static getUserExtensionsDir(): string;
    static createTmpDir(): Promise<string>;
}
