/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ExtensionManager } from '../../config/extension-manager.js';
export declare function getExtensionManager(): Promise<ExtensionManager>;
export declare function getExtensionAndManager(name: string): Promise<{
    extension: null;
    extensionManager: null;
} | {
    extension: import("@google/gemini-cli-core").GeminiCLIExtension;
    extensionManager: ExtensionManager;
}>;
