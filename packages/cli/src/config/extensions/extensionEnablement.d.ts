/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type GeminiCLIExtension } from '@google/gemini-cli-core';
export interface ExtensionEnablementConfig {
    overrides: string[];
}
export interface AllExtensionsEnablementConfig {
    [extensionName: string]: ExtensionEnablementConfig;
}
export declare class Override {
    baseRule: string;
    isDisable: boolean;
    includeSubdirs: boolean;
    constructor(baseRule: string, isDisable: boolean, includeSubdirs: boolean);
    static fromInput(inputRule: string, includeSubdirs: boolean): Override;
    static fromFileRule(fileRule: string): Override;
    conflictsWith(other: Override): boolean;
    isEqualTo(other: Override): boolean;
    asRegex(): RegExp;
    isChildOf(parent: Override): boolean;
    output(): string;
    matchesPath(path: string): boolean;
}
export declare class ExtensionEnablementManager {
    private configFilePath;
    private configDir;
    private enabledExtensionNamesOverride;
    constructor(enabledExtensionNames?: string[]);
    validateExtensionOverrides(extensions: GeminiCLIExtension[]): void;
    /**
     * Determines if an extension is enabled based on its name and the current
     * path. The last matching rule in the overrides list wins.
     *
     * @param extensionName The name of the extension.
     * @param currentPath The absolute path of the current working directory.
     * @returns True if the extension is enabled, false otherwise.
     */
    isEnabled(extensionName: string, currentPath: string): boolean;
    readConfig(): AllExtensionsEnablementConfig;
    writeConfig(config: AllExtensionsEnablementConfig): void;
    enable(extensionName: string, includeSubdirs: boolean, scopePath: string): void;
    disable(extensionName: string, includeSubdirs: boolean, scopePath: string): void;
    remove(extensionName: string): void;
}
