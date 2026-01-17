/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoadableSettingScope, LoadedSettings } from '../../config/settings.js';
import type { EditorType } from '@google/gemini-cli-core';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
interface UseEditorSettingsReturn {
    isEditorDialogOpen: boolean;
    openEditorDialog: () => void;
    handleEditorSelect: (editorType: EditorType | undefined, scope: LoadableSettingScope) => void;
    exitEditorDialog: () => void;
}
export declare const useEditorSettings: (loadedSettings: LoadedSettings, setEditorError: (error: string | null) => void, addItem: UseHistoryManagerReturn["addItem"]) => UseEditorSettingsReturn;
export {};
