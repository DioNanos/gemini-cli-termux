/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type EditorType } from '@google/gemini-cli-core';
export interface EditorDisplay {
    name: string;
    type: EditorType | 'not_set';
    disabled: boolean;
}
declare class EditorSettingsManager {
    private readonly availableEditors;
    constructor();
    getAvailableEditorDisplays(): EditorDisplay[];
}
export declare const editorSettingsManager: EditorSettingsManager;
export {};
