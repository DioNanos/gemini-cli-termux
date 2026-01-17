/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ExtensionUpdateAction, ExtensionUpdateState, type ExtensionUpdateStatus } from '../../ui/state/extensions.js';
import { type GeminiCLIExtension } from '@google/gemini-cli-core';
import { type ExtensionManager } from '../extension-manager.js';
export interface ExtensionUpdateInfo {
    name: string;
    originalVersion: string;
    updatedVersion: string;
}
export declare function updateExtension(extension: GeminiCLIExtension, extensionManager: ExtensionManager, currentState: ExtensionUpdateState, dispatchExtensionStateUpdate: (action: ExtensionUpdateAction) => void, enableExtensionReloading?: boolean): Promise<ExtensionUpdateInfo | undefined>;
export declare function updateAllUpdatableExtensions(extensions: GeminiCLIExtension[], extensionsState: Map<string, ExtensionUpdateStatus>, extensionManager: ExtensionManager, dispatch: (action: ExtensionUpdateAction) => void, enableExtensionReloading?: boolean): Promise<ExtensionUpdateInfo[]>;
export interface ExtensionUpdateCheckResult {
    state: ExtensionUpdateState;
    error?: string;
}
export declare function checkForAllExtensionUpdates(extensions: GeminiCLIExtension[], extensionManager: ExtensionManager, dispatch: (action: ExtensionUpdateAction) => void): Promise<void>;
