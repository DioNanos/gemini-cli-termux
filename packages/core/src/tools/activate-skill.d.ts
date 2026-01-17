/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { ToolResult, ToolInvocation } from './tools.js';
import { BaseDeclarativeTool } from './tools.js';
import type { Config } from '../config/config.js';
/**
 * Parameters for the ActivateSkill tool
 */
export interface ActivateSkillToolParams {
    /**
     * The name of the skill to activate
     */
    name: string;
}
/**
 * Implementation of the ActivateSkill tool logic
 */
export declare class ActivateSkillTool extends BaseDeclarativeTool<ActivateSkillToolParams, ToolResult> {
    private config;
    static readonly Name = "activate_skill";
    constructor(config: Config, messageBus: MessageBus);
    protected createInvocation(params: ActivateSkillToolParams, messageBus: MessageBus, _toolName?: string, _toolDisplayName?: string): ToolInvocation<ActivateSkillToolParams, ToolResult>;
}
