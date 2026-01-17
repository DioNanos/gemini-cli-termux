/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Storage } from '../config/storage.js';
import { loadSkillsFromDir } from './skillLoader.js';
import { debugLogger } from '../utils/debugLogger.js';
import { coreEvents } from '../utils/events.js';
export {};
export class SkillManager {
    skills = [];
    activeSkillNames = new Set();
    adminSkillsEnabled = true;
    /**
     * Clears all discovered skills.
     */
    clearSkills() {
        this.skills = [];
    }
    /**
     * Sets administrative settings for skills.
     */
    setAdminSettings(enabled) {
        this.adminSkillsEnabled = enabled;
    }
    /**
     * Returns true if skills are enabled by the admin.
     */
    isAdminEnabled() {
        return this.adminSkillsEnabled;
    }
    /**
     * Discovers skills from standard user and workspace locations, as well as extensions.
     * Precedence: Extensions (lowest) -> User -> Workspace (highest).
     */
    async discoverSkills(storage, extensions = []) {
        this.clearSkills();
        // 1. Built-in skills (lowest precedence)
        await this.discoverBuiltinSkills();
        // 2. Extension skills
        for (const extension of extensions) {
            if (extension.isActive && extension.skills) {
                this.addSkillsWithPrecedence(extension.skills);
            }
        }
        // 3. User skills
        const userSkills = await loadSkillsFromDir(Storage.getUserSkillsDir());
        this.addSkillsWithPrecedence(userSkills);
        // 4. Workspace skills (highest precedence)
        const projectSkills = await loadSkillsFromDir(storage.getProjectSkillsDir());
        this.addSkillsWithPrecedence(projectSkills);
    }
    /**
     * Discovers built-in skills.
     */
    async discoverBuiltinSkills() {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const builtinDir = path.join(__dirname, 'builtin');
        const builtinSkills = await loadSkillsFromDir(builtinDir);
        for (const skill of builtinSkills) {
            skill.isBuiltin = true;
        }
        this.addSkillsWithPrecedence(builtinSkills);
    }
    addSkillsWithPrecedence(newSkills) {
        const skillMap = new Map(this.skills.map((s) => [s.name, s]));
        for (const newSkill of newSkills) {
            const existingSkill = skillMap.get(newSkill.name);
            if (existingSkill && existingSkill.location !== newSkill.location) {
                if (existingSkill.isBuiltin) {
                    debugLogger.warn(`Skill "${newSkill.name}" from "${newSkill.location}" is overriding the built-in skill.`);
                }
                else {
                    coreEvents.emitFeedback('warning', `Skill conflict detected: "${newSkill.name}" from "${newSkill.location}" is overriding the same skill from "${existingSkill.location}".`);
                }
            }
            skillMap.set(newSkill.name, newSkill);
        }
        this.skills = Array.from(skillMap.values());
    }
    /**
     * Returns the list of enabled discovered skills.
     */
    getSkills() {
        return this.skills.filter((s) => !s.disabled);
    }
    /**
     * Returns the list of enabled discovered skills that should be displayed in the UI.
     * This excludes built-in skills.
     */
    getDisplayableSkills() {
        return this.skills.filter((s) => !s.disabled && !s.isBuiltin);
    }
    /**
     * Returns all discovered skills, including disabled ones.
     */
    getAllSkills() {
        return this.skills;
    }
    /**
     * Filters discovered skills by name.
     */
    filterSkills(predicate) {
        this.skills = this.skills.filter(predicate);
    }
    /**
     * Sets the list of disabled skill names.
     */
    setDisabledSkills(disabledNames) {
        const lowercaseDisabledNames = disabledNames.map((n) => n.toLowerCase());
        for (const skill of this.skills) {
            skill.disabled = lowercaseDisabledNames.includes(skill.name.toLowerCase());
        }
    }
    /**
     * Reads the full content (metadata + body) of a skill by name.
     */
    getSkill(name) {
        const lowercaseName = name.toLowerCase();
        return (this.skills.find((s) => s.name.toLowerCase() === lowercaseName) ?? null);
    }
    /**
     * Activates a skill by name.
     */
    activateSkill(name) {
        this.activeSkillNames.add(name);
    }
    /**
     * Checks if a skill is active.
     */
    isSkillActive(name) {
        return this.activeSkillNames.has(name);
    }
}
//# sourceMappingURL=skillManager.js.map