/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MCPServerConfig, ExtensionInstallMetadata } from '@google/gemini-cli-core';
import type { ExtensionSetting } from './extensions/extensionSettings.js';
/**
 * Extension definition as written to disk in gemini-extension.json files.
 * This should *not* be referenced outside of the logic for reading files.
 * If information is required for manipulating extensions (load, unload, update)
 * outside of the loading process that data needs to be stored on the
 * GeminiCLIExtension class defined in Core.
 */
export interface ExtensionConfig {
    name: string;
    version: string;
    mcpServers?: Record<string, MCPServerConfig>;
    contextFileName?: string | string[];
    excludeTools?: string[];
    settings?: ExtensionSetting[];
}
export interface ExtensionUpdateInfo {
    name: string;
    originalVersion: string;
    updatedVersion: string;
}
export declare function loadInstallMetadata(extensionDir: string): ExtensionInstallMetadata | undefined;
