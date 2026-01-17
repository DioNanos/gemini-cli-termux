/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ExtensionInstallMetadata, type GeminiCLIExtension } from '@google/gemini-cli-core';
export declare const EXTENSIONS_DIRECTORY_NAME: string;
export declare const EXTENSIONS_CONFIG_FILENAME = "gemini-extension.json";
export declare const INSTALL_METADATA_FILENAME = ".gemini-extension-install.json";
export declare function loadExtensions(workspaceDir: string): GeminiCLIExtension[];
export declare function loadInstallMetadata(extensionDir: string): ExtensionInstallMetadata | undefined;
