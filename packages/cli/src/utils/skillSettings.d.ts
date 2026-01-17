/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { SettingScope, type LoadedSettings } from '../config/settings.js';
export interface ModifiedScope {
    scope: SettingScope;
    path: string;
}
export type SkillActionStatus = 'success' | 'no-op' | 'error';
/**
 * Metadata representing the result of a skill settings operation.
 */
export interface SkillActionResult {
    status: SkillActionStatus;
    skillName: string;
    action: 'enable' | 'disable';
    /** Scopes where the skill's state was actually changed. */
    modifiedScopes: ModifiedScope[];
    /** Scopes where the skill was already in the desired state. */
    alreadyInStateScopes: ModifiedScope[];
    /** Error message if status is 'error'. */
    error?: string;
}
/**
 * Enables a skill by removing it from all writable disabled lists (User and Workspace).
 */
export declare function enableSkill(settings: LoadedSettings, skillName: string): SkillActionResult;
/**
 * Disables a skill by adding it to the disabled list in the specified scope.
 */
export declare function disableSkill(settings: LoadedSettings, skillName: string, scope: SettingScope): SkillActionResult;
