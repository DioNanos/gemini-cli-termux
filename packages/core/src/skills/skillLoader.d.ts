/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Represents the definition of an Agent Skill.
 */
export interface SkillDefinition {
    /** The unique name of the skill. */
    name: string;
    /** A concise description of what the skill does. */
    description: string;
    /** The absolute path to the skill's source file on disk. */
    location: string;
    /** The core logic/instructions of the skill. */
    body: string;
    /** Whether the skill is currently disabled. */
    disabled?: boolean;
    /** Whether the skill is a built-in skill. */
    isBuiltin?: boolean;
}
export declare const FRONTMATTER_REGEX: RegExp;
/**
 * Discovers and loads all skills in the provided directory.
 */
export declare function loadSkillsFromDir(dir: string): Promise<SkillDefinition[]>;
/**
 * Loads a single skill from a SKILL.md file.
 */
export declare function loadSkillFromFile(filePath: string): Promise<SkillDefinition | null>;
