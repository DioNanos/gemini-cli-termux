/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ExtensionConfig } from '../extension.js';
export declare enum ExtensionSettingScope {
    USER = "user",
    WORKSPACE = "workspace"
}
export interface ExtensionSetting {
    name: string;
    description: string;
    envVar: string;
    sensitive?: boolean;
}
export declare const getEnvFilePath: (extensionName: string, scope: ExtensionSettingScope, workspaceDir?: string) => string;
export declare function maybePromptForSettings(extensionConfig: ExtensionConfig, extensionId: string, requestSetting: (setting: ExtensionSetting) => Promise<string>, previousExtensionConfig?: ExtensionConfig, previousSettings?: Record<string, string>): Promise<void>;
export declare function promptForSetting(setting: ExtensionSetting): Promise<string>;
export declare function getScopedEnvContents(extensionConfig: ExtensionConfig, extensionId: string, scope: ExtensionSettingScope, workspaceDir?: string): Promise<Record<string, string>>;
export declare function getEnvContents(extensionConfig: ExtensionConfig, extensionId: string, workspaceDir: string): Promise<Record<string, string>>;
export declare function updateSetting(extensionConfig: ExtensionConfig, extensionId: string, settingKey: string, requestSetting: (setting: ExtensionSetting) => Promise<string>, scope: ExtensionSettingScope, workspaceDir?: string): Promise<void>;
export declare function getMissingSettings(extensionConfig: ExtensionConfig, extensionId: string, workspaceDir: string): Promise<ExtensionSetting[]>;
