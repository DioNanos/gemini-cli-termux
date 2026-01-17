/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { BaseDeclarativeTool, Kind, BaseToolInvocation, } from '../tools/tools.js';
import { DELEGATE_TO_AGENT_TOOL_NAME } from '../tools/tool-names.js';
import { SubagentToolWrapper } from './subagent-tool-wrapper.js';
export class DelegateToAgentTool extends BaseDeclarativeTool {
    registry;
    config;
    constructor(registry, config, messageBus) {
        const definitions = registry.getAllDefinitions();
        let schema;
        if (definitions.length === 0) {
            // Fallback if no agents are registered (mostly for testing/safety)
            schema = z.object({
                agent_name: z.string().describe('No agents are currently available.'),
            });
        }
        else {
            const agentSchemas = definitions.map((def) => {
                const inputShape = {
                    agent_name: z.literal(def.name).describe(def.description),
                };
                for (const [key, inputDef] of Object.entries(def.inputConfig.inputs)) {
                    if (key === 'agent_name') {
                        throw new Error(`Agent '${def.name}' cannot have an input parameter named 'agent_name' as it is a reserved parameter for delegation.`);
                    }
                    let validator;
                    // Map input types to Zod
                    switch (inputDef.type) {
                        case 'string':
                            validator = z.string();
                            break;
                        case 'number':
                            validator = z.number();
                            break;
                        case 'boolean':
                            validator = z.boolean();
                            break;
                        case 'integer':
                            validator = z.number().int();
                            break;
                        case 'string[]':
                            validator = z.array(z.string());
                            break;
                        case 'number[]':
                            validator = z.array(z.number());
                            break;
                        default: {
                            // This provides compile-time exhaustiveness checking.
                            const _exhaustiveCheck = inputDef.type;
                            void _exhaustiveCheck;
                            throw new Error(`Unhandled agent input type: '${inputDef.type}'`);
                        }
                    }
                    if (!inputDef.required) {
                        validator = validator.optional();
                    }
                    inputShape[key] = validator.describe(inputDef.description);
                }
                // Cast required because Zod can't infer the discriminator from dynamic keys
                return z.object(inputShape);
            });
            // Create the discriminated union
            // z.discriminatedUnion requires at least 2 options, so we handle the single agent case
            if (agentSchemas.length === 1) {
                schema = agentSchemas[0];
            }
            else {
                schema = z.discriminatedUnion('agent_name', agentSchemas);
            }
        }
        super(DELEGATE_TO_AGENT_TOOL_NAME, 'Delegate to Agent', registry.getToolDescription(), Kind.Think, zodToJsonSchema(schema), messageBus, 
        /* isOutputMarkdown */ true, 
        /* canUpdateOutput */ true);
        this.registry = registry;
        this.config = config;
    }
    createInvocation(params, messageBus, _toolName, _toolDisplayName) {
        return new DelegateInvocation(params, this.registry, this.config, messageBus, _toolName, _toolDisplayName);
    }
}
class DelegateInvocation extends BaseToolInvocation {
    registry;
    config;
    constructor(params, registry, config, messageBus, _toolName, _toolDisplayName) {
        super(params, messageBus, _toolName ?? DELEGATE_TO_AGENT_TOOL_NAME, _toolDisplayName);
        this.registry = registry;
        this.config = config;
    }
    getDescription() {
        return `Delegating to agent '${this.params.agent_name}'`;
    }
    async shouldConfirmExecute(abortSignal) {
        const definition = this.registry.getDefinition(this.params.agent_name);
        if (!definition || definition.kind !== 'remote') {
            // Local agents should execute without confirmation. Inner tool calls will bubble up their own confirmations to the user.
            return false;
        }
        const { agent_name: _agent_name, ...agentArgs } = this.params;
        const invocation = this.buildSubInvocation(definition, agentArgs);
        return invocation.shouldConfirmExecute(abortSignal);
    }
    async execute(signal, updateOutput) {
        const definition = this.registry.getDefinition(this.params.agent_name);
        if (!definition) {
            throw new Error(`Agent '${this.params.agent_name}' not found in registry.`);
        }
        const { agent_name: _agent_name, ...agentArgs } = this.params;
        const invocation = this.buildSubInvocation(definition, agentArgs);
        return invocation.execute(signal, updateOutput);
    }
    buildSubInvocation(definition, agentArgs) {
        const wrapper = new SubagentToolWrapper(definition, this.config, this.messageBus);
        return wrapper.build(agentArgs);
    }
}
//# sourceMappingURL=delegate-to-agent-tool.js.map