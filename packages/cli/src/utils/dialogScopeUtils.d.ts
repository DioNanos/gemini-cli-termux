/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoadableSettingScope, LoadedSettings } from '../config/settings.js';
/**
 * Shared scope labels for dialog components that need to display setting scopes
 */
export declare const SCOPE_LABELS: {
    readonly User: "User Settings";
    readonly Workspace: "Workspace Settings";
    readonly System: "System Settings";
};
/**
 * Helper function to get scope items for radio button selects
 */
export declare function getScopeItems(): Array<{
    label: string;
    value: LoadableSettingScope;
}>;
/**
 * Generate scope message for a specific setting
 */
export declare function getScopeMessageForSetting(settingKey: string, selectedScope: LoadableSettingScope, settings: LoadedSettings): string;
