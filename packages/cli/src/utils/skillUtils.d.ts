/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SkillActionResult } from './skillSettings.js';
import { type SkillDefinition } from '@google/gemini-cli-core';
/**
 * Shared logic for building the core skill action message while allowing the
 * caller to control how each scope and its path are rendered (e.g., bolding or
 * dimming).
 *
 * This function ONLY returns the description of what happened. It is up to the
 * caller to append any interface-specific guidance (like "Use /skills reload"
 * or "Restart required").
 */
export declare function renderSkillActionFeedback(result: SkillActionResult, formatScope: (label: string, path: string) => string): string;
/**
 * Central logic for installing a skill from a remote URL or local path.
 */
export declare function installSkill(source: string, scope: 'user' | 'workspace', subpath: string | undefined, onLog: (msg: string) => void, requestConsent?: (skills: SkillDefinition[], targetDir: string) => Promise<boolean>): Promise<Array<{
    name: string;
    location: string;
}>>;
/**
 * Central logic for uninstalling a skill by name.
 */
export declare function uninstallSkill(name: string, scope: 'user' | 'workspace'): Promise<{
    location: string;
} | null>;
