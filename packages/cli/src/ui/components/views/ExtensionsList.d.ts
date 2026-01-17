/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type GeminiCLIExtension } from '@google/gemini-cli-core';
interface ExtensionsList {
    extensions: readonly GeminiCLIExtension[];
}
export declare const ExtensionsList: React.FC<ExtensionsList>;
export {};
