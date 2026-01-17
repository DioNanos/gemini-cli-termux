/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type MergedSettings, SettingScope } from './settings.js';
import { type ExtensionConfig } from './extension.js';
import { ExtensionLoader, type ExtensionEvents, type ExtensionInstallMetadata, type GeminiCLIExtension } from '@google/gemini-cli-core';
import { type ExtensionSetting } from './extensions/extensionSettings.js';
import type { EventEmitter } from 'node:stream';
interface ExtensionManagerParams {
    enabledExtensionOverrides?: string[];
    settings: MergedSettings;
    requestConsent: (consent: string) => Promise<boolean>;
    requestSetting: ((setting: ExtensionSetting) => Promise<string>) | null;
    workspaceDir: string;
    eventEmitter?: EventEmitter<ExtensionEvents>;
}
/**
 * Actual implementation of an ExtensionLoader.
 *
 * You must call `loadExtensions` prior to calling other methods on this class.
 */
export declare class ExtensionManager extends ExtensionLoader {
    private extensionEnablementManager;
    private settings;
    private requestConsent;
    private requestSetting;
    private telemetryConfig;
    private workspaceDir;
    private loadedExtensions;
    constructor(options: ExtensionManagerParams);
    setRequestConsent(requestConsent: (consent: string) => Promise<boolean>): void;
    setRequestSetting(requestSetting?: (setting: ExtensionSetting) => Promise<string>): void;
    getExtensions(): GeminiCLIExtension[];
    installOrUpdateExtension(installMetadata: ExtensionInstallMetadata, previousExtensionConfig?: ExtensionConfig): Promise<GeminiCLIExtension>;
    uninstallExtension(extensionIdentifier: string, isUpdate: boolean): Promise<void>;
    /**
     * Loads all installed extensions, should only be called once.
     */
    loadExtensions(): Promise<GeminiCLIExtension[]>;
    /**
     * Adds `extension` to the list of extensions and starts it if appropriate.
     */
    private loadExtension;
    /**
     * Removes `extension` from the list of extensions and stops it if
     * appropriate.
     */
    private unloadExtension;
    loadExtensionConfig(extensionDir: string): Promise<ExtensionConfig>;
    private loadExtensionHooks;
    toOutputString(extension: GeminiCLIExtension): string;
    disableExtension(name: string, scope: SettingScope): Promise<void>;
    /**
     * Enables an existing extension for a given scope, and starts it if
     * appropriate.
     */
    enableExtension(name: string, scope: SettingScope): Promise<void>;
}
export declare function copyExtension(source: string, destination: string): Promise<void>;
export declare function inferInstallMetadata(source: string, args?: {
    ref?: string;
    autoUpdate?: boolean;
    allowPreRelease?: boolean;
}): Promise<ExtensionInstallMetadata>;
export declare function getExtensionId(config: ExtensionConfig, installMetadata?: ExtensionInstallMetadata): string;
export declare function hashValue(value: string): string;
export {};
