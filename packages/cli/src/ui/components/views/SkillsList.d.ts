/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type SkillDefinition } from '../../types.js';
interface SkillsListProps {
    skills: readonly SkillDefinition[];
    showDescriptions: boolean;
}
export declare const SkillsList: React.FC<SkillsListProps>;
export {};
