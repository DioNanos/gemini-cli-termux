/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Storage } from '../config/storage.js';
import { type SkillDefinition } from './skillLoader.js';
import type { GeminiCLIExtension } from '../config/config.js';
export { type SkillDefinition };
export declare class SkillManager {
    private skills;
    private activeSkillNames;
    private adminSkillsEnabled;
    /**
     * Clears all discovered skills.
     */
    clearSkills(): void;
    /**
     * Sets administrative settings for skills.
     */
    setAdminSettings(enabled: boolean): void;
    /**
     * Returns true if skills are enabled by the admin.
     */
    isAdminEnabled(): boolean;
    /**
     * Discovers skills from standard user and workspace locations, as well as extensions.
     * Precedence: Extensions (lowest) -> User -> Workspace (highest).
     */
    discoverSkills(storage: Storage, extensions?: GeminiCLIExtension[]): Promise<void>;
    /**
     * Discovers built-in skills.
     */
    private discoverBuiltinSkills;
    private addSkillsWithPrecedence;
    /**
     * Returns the list of enabled discovered skills.
     */
    getSkills(): SkillDefinition[];
    /**
     * Returns the list of enabled discovered skills that should be displayed in the UI.
     * This excludes built-in skills.
     */
    getDisplayableSkills(): SkillDefinition[];
    /**
     * Returns all discovered skills, including disabled ones.
     */
    getAllSkills(): SkillDefinition[];
    /**
     * Filters discovered skills by name.
     */
    filterSkills(predicate: (skill: SkillDefinition) => boolean): void;
    /**
     * Sets the list of disabled skill names.
     */
    setDisabledSkills(disabledNames: string[]): void;
    /**
     * Reads the full content (metadata + body) of a skill by name.
     */
    getSkill(name: string): SkillDefinition | null;
    /**
     * Activates a skill by name.
     */
    activateSkill(name: string): void;
    /**
     * Checks if a skill is active.
     */
    isSkillActive(name: string): boolean;
}
