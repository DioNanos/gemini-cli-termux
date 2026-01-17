/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { LoadableSettingScope, LoadedSettings } from '../../config/settings.js';
interface ThemeDialogProps {
    /** Callback function when a theme is selected */
    onSelect: (themeName: string, scope: LoadableSettingScope) => void;
    /** Callback function when the dialog is cancelled */
    onCancel: () => void;
    /** Callback function when a theme is highlighted */
    onHighlight: (themeName: string | undefined) => void;
    /** The settings object */
    settings: LoadedSettings;
    availableTerminalHeight?: number;
    terminalWidth: number;
}
export declare function ThemeDialog({ onSelect, onCancel, onHighlight, settings, availableTerminalHeight, terminalWidth, }: ThemeDialogProps): React.JSX.Element;
export {};
