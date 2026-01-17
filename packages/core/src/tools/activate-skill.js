/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as path from 'node:path';
import { getFolderStructure } from '../utils/getFolderStructure.js';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from './tools.js';
import { ACTIVATE_SKILL_TOOL_NAME } from './tool-names.js';
import { ToolErrorType } from './tool-error.js';
class ActivateSkillToolInvocation extends BaseToolInvocation {
    config;
    cachedFolderStructure;
    constructor(config, params, messageBus, _toolName, _toolDisplayName) {
        super(params, messageBus, _toolName, _toolDisplayName);
        this.config = config;
    }
    getDescription() {
        const skillName = this.params.name;
        const skill = this.config.getSkillManager().getSkill(skillName);
        if (skill) {
            return `"${skillName}": ${skill.description}`;
        }
        return `"${skillName}" (?) unknown skill`;
    }
    async getOrFetchFolderStructure(skillLocation) {
        if (this.cachedFolderStructure === undefined) {
            this.cachedFolderStructure = await getFolderStructure(path.dirname(skillLocation));
        }
        return this.cachedFolderStructure;
    }
    async getConfirmationDetails(_abortSignal) {
        if (!this.messageBus) {
            return false;
        }
        const skillName = this.params.name;
        const skill = this.config.getSkillManager().getSkill(skillName);
        if (!skill) {
            return false;
        }
        if (skill.isBuiltin) {
            return false;
        }
        const folderStructure = await this.getOrFetchFolderStructure(skill.location);
        const confirmationDetails = {
            type: 'info',
            title: `Activate Skill: ${skillName}`,
            prompt: `You are about to enable the specialized agent skill **${skillName}**.

**Description:**
${skill.description}

**Resources to be shared with the model:**
${folderStructure}`,
            onConfirm: async (outcome) => {
                await this.publishPolicyUpdate(outcome);
            },
        };
        return confirmationDetails;
    }
    async execute(_signal) {
        const skillName = this.params.name;
        const skillManager = this.config.getSkillManager();
        const skill = skillManager.getSkill(skillName);
        if (!skill) {
            const skills = skillManager.getSkills();
            const availableSkills = skills.map((s) => s.name).join(', ');
            const errorMessage = `Skill "${skillName}" not found. Available skills are: ${availableSkills}`;
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.INVALID_TOOL_PARAMS,
                },
            };
        }
        skillManager.activateSkill(skillName);
        // Add the skill's directory to the workspace context so the agent has permission
        // to read its bundled resources.
        this.config
            .getWorkspaceContext()
            .addDirectory(path.dirname(skill.location));
        const folderStructure = await this.getOrFetchFolderStructure(skill.location);
        return {
            llmContent: `<activated_skill name="${skillName}">
  <instructions>
    ${skill.body}
  </instructions>

  <available_resources>
    ${folderStructure}
  </available_resources>
</activated_skill>`,
            returnDisplay: `Skill **${skillName}** activated. Resources loaded from \`${path.dirname(skill.location)}\`:\n\n${folderStructure}`,
        };
    }
}
/**
 * Implementation of the ActivateSkill tool logic
 */
export class ActivateSkillTool extends BaseDeclarativeTool {
    config;
    static Name = ACTIVATE_SKILL_TOOL_NAME;
    constructor(config, messageBus) {
        const skills = config.getSkillManager().getSkills();
        const skillNames = skills.map((s) => s.name);
        let schema;
        if (skillNames.length === 0) {
            schema = z.object({
                name: z.string().describe('No skills are currently available.'),
            });
        }
        else {
            schema = z.object({
                name: z
                    .enum(skillNames)
                    .describe('The name of the skill to activate.'),
            });
        }
        const availableSkillsHint = skillNames.length > 0
            ? ` (Available: ${skillNames.map((n) => `'${n}'`).join(', ')})`
            : '';
        super(ActivateSkillTool.Name, 'Activate Skill', `Activates a specialized agent skill by name${availableSkillsHint}. Returns the skill's instructions wrapped in \`<activated_skill>\` tags. These provide specialized guidance for the current task. Use this when you identify a task that matches a skill's description. ONLY use names exactly as they appear in the \`<available_skills>\` section.`, Kind.Other, zodToJsonSchema(schema), messageBus, true, false);
        this.config = config;
    }
    createInvocation(params, messageBus, _toolName, _toolDisplayName) {
        return new ActivateSkillToolInvocation(this.config, params, messageBus, _toolName, _toolDisplayName ?? 'Activate Skill');
    }
}
//# sourceMappingURL=activate-skill.js.map