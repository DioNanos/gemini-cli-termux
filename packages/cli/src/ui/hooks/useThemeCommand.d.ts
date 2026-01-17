/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoadableSettingScope, LoadedSettings } from '../../config/settings.js';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
interface UseThemeCommandReturn {
    isThemeDialogOpen: boolean;
    openThemeDialog: () => void;
    closeThemeDialog: () => void;
    handleThemeSelect: (themeName: string, scope: LoadableSettingScope) => void;
    handleThemeHighlight: (themeName: string | undefined) => void;
}
export declare const useThemeCommand: (loadedSettings: LoadedSettings, setThemeError: (error: string | null) => void, addItem: UseHistoryManagerReturn["addItem"], initialThemeError: string | null) => UseThemeCommandReturn;
export {};
