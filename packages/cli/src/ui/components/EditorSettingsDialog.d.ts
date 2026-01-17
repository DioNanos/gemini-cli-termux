/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { LoadableSettingScope, LoadedSettings } from '../../config/settings.js';
import { type EditorType } from '@google/gemini-cli-core';
interface EditorDialogProps {
    onSelect: (editorType: EditorType | undefined, scope: LoadableSettingScope) => void;
    settings: LoadedSettings;
    onExit: () => void;
}
export declare function EditorSettingsDialog({ onSelect, settings, onExit, }: EditorDialogProps): React.JSX.Element;
export {};
