/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DelegateToAgentTool } from './delegate-to-agent-tool.js';
import { AgentRegistry } from './registry.js';
import { LocalSubagentInvocation } from './local-invocation.js';
import { MessageBusType } from '../confirmation-bus/types.js';
import { DELEGATE_TO_AGENT_TOOL_NAME } from '../tools/tool-names.js';
import { RemoteAgentInvocation } from './remote-invocation.js';
import { createMockMessageBus } from '../test-utils/mock-message-bus.js';
vi.mock('./local-invocation.js', () => ({
    LocalSubagentInvocation: vi.fn().mockImplementation(() => ({
        execute: vi
            .fn()
            .mockResolvedValue({ content: [{ type: 'text', text: 'Success' }] }),
        shouldConfirmExecute: vi.fn().mockResolvedValue(false),
    })),
}));
vi.mock('./remote-invocation.js', () => ({
    RemoteAgentInvocation: vi.fn().mockImplementation(() => ({
        execute: vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'Remote Success' }],
        }),
        shouldConfirmExecute: vi.fn().mockResolvedValue({
            type: 'info',
            title: 'Remote Confirmation',
            prompt: 'Confirm remote call',
            onConfirm: vi.fn(),
        }),
    })),
}));
describe('DelegateToAgentTool', () => {
    let registry;
    let config;
    let tool;
    let messageBus;
    const mockAgentDef = {
        kind: 'local',
        name: 'test_agent',
        description: 'A test agent',
        promptConfig: {},
        modelConfig: {
            model: 'test-model',
            generateContentConfig: {
                temperature: 0,
                topP: 0,
            },
        },
        inputConfig: {
            inputs: {
                arg1: { type: 'string', description: 'Argument 1', required: true },
                arg2: { type: 'number', description: 'Argument 2', required: false },
            },
        },
        runConfig: { maxTurns: 1, maxTimeMinutes: 1 },
        toolConfig: { tools: [] },
    };
    const mockRemoteAgentDef = {
        kind: 'remote',
        name: 'remote_agent',
        description: 'A remote agent',
        agentCardUrl: 'https://example.com/agent.json',
        inputConfig: {
            inputs: {
                query: { type: 'string', description: 'Query', required: true },
            },
        },
    };
    beforeEach(() => {
        config = {
            getDebugMode: () => false,
            getActiveModel: () => 'test-model',
            modelConfigService: {
                registerRuntimeModelConfig: vi.fn(),
            },
        };
        registry = new AgentRegistry(config);
        // Manually register the mock agent (bypassing protected method for testing)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registry.agents.set(mockAgentDef.name, mockAgentDef);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registry.agents.set(mockRemoteAgentDef.name, mockRemoteAgentDef);
        messageBus = createMockMessageBus();
        tool = new DelegateToAgentTool(registry, config, messageBus);
    });
    it('should use dynamic description from registry', () => {
        // registry has mockAgentDef registered in beforeEach
        expect(tool.description).toContain('Delegates a task to a specialized sub-agent');
        expect(tool.description).toContain(`- **${mockAgentDef.name}**: ${mockAgentDef.description}`);
    });
    it('should validate agent_name exists in registry', async () => {
        // Zod validation happens at build time now (or rather, build validates the schema)
        // Since we use discriminated union, an invalid agent_name won't match any option.
        expect(() => tool.build({
            agent_name: 'non_existent_agent',
        })).toThrow();
    });
    it('should validate correct arguments', async () => {
        const invocation = tool.build({
            agent_name: 'test_agent',
            arg1: 'valid',
        });
        const result = await invocation.execute(new AbortController().signal);
        expect(result).toEqual({ content: [{ type: 'text', text: 'Success' }] });
        expect(LocalSubagentInvocation).toHaveBeenCalledWith(mockAgentDef, config, { arg1: 'valid' }, messageBus, mockAgentDef.name, mockAgentDef.name);
    });
    it('should throw error for missing required argument', async () => {
        // Missing arg1 should fail Zod validation
        expect(() => tool.build({
            agent_name: 'test_agent',
            arg2: 123,
        })).toThrow();
    });
    it('should throw error for invalid argument type', async () => {
        // arg1 should be string, passing number
        expect(() => tool.build({
            agent_name: 'test_agent',
            arg1: 123,
        })).toThrow();
    });
    it('should allow optional arguments to be omitted', async () => {
        const invocation = tool.build({
            agent_name: 'test_agent',
            arg1: 'valid',
            // arg2 is optional
        });
        await expect(invocation.execute(new AbortController().signal)).resolves.toBeDefined();
    });
    it('should throw error if an agent has an input named "agent_name"', () => {
        const invalidAgentDef = {
            ...mockAgentDef,
            name: 'invalid_agent',
            inputConfig: {
                inputs: {
                    agent_name: {
                        type: 'string',
                        description: 'Conflict',
                        required: true,
                    },
                },
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registry.agents.set(invalidAgentDef.name, invalidAgentDef);
        expect(() => new DelegateToAgentTool(registry, config, messageBus)).toThrow("Agent 'invalid_agent' cannot have an input parameter named 'agent_name' as it is a reserved parameter for delegation.");
    });
    it('should execute local agents silently without requesting confirmation', async () => {
        const invocation = tool.build({
            agent_name: 'test_agent',
            arg1: 'valid',
        });
        // Trigger confirmation check
        const result = await invocation.shouldConfirmExecute(new AbortController().signal);
        expect(result).toBe(false);
        // Verify it did NOT call messageBus.publish with 'delegate_to_agent'
        const delegateToAgentPublish = vi
            .mocked(messageBus.publish)
            .mock.calls.find((call) => call[0].type === MessageBusType.TOOL_CONFIRMATION_REQUEST &&
            call[0].toolCall.name === DELEGATE_TO_AGENT_TOOL_NAME);
        expect(delegateToAgentPublish).toBeUndefined();
    });
    it('should delegate to remote agent correctly', async () => {
        const invocation = tool.build({
            agent_name: 'remote_agent',
            query: 'hello remote',
        });
        const result = await invocation.execute(new AbortController().signal);
        expect(result).toEqual({
            content: [{ type: 'text', text: 'Remote Success' }],
        });
        expect(RemoteAgentInvocation).toHaveBeenCalledWith(mockRemoteAgentDef, { query: 'hello remote' }, messageBus, 'remote_agent', 'remote_agent');
    });
    describe('Confirmation', () => {
        it('should return false for local agents (silent execution)', async () => {
            const invocation = tool.build({
                agent_name: 'test_agent',
                arg1: 'valid',
            });
            // Local agents should now return false directly, bypassing policy check
            const result = await invocation.shouldConfirmExecute(new AbortController().signal);
            expect(result).toBe(false);
            const delegateToAgentPublish = vi
                .mocked(messageBus.publish)
                .mock.calls.find((call) => call[0].type === MessageBusType.TOOL_CONFIRMATION_REQUEST &&
                call[0].toolCall.name === DELEGATE_TO_AGENT_TOOL_NAME);
            expect(delegateToAgentPublish).toBeUndefined();
        });
        it('should forward to remote agent confirmation logic', async () => {
            const invocation = tool.build({
                agent_name: 'remote_agent',
                query: 'hello remote',
            });
            const result = await invocation.shouldConfirmExecute(new AbortController().signal);
            // Verify it returns the mock confirmation from RemoteAgentInvocation
            expect(result).toMatchObject({
                type: 'info',
                title: 'Remote Confirmation',
            });
            // Verify it did NOT call messageBus.publish with 'delegate_to_agent'
            // directly from DelegateInvocation, but instead went into RemoteAgentInvocation.
            // RemoteAgentInvocation (the mock) doesn't call publish in its mock implementation.
            const delegateToAgentPublish = vi
                .mocked(messageBus.publish)
                .mock.calls.find((call) => call[0].type === MessageBusType.TOOL_CONFIRMATION_REQUEST &&
                call[0].toolCall.name === DELEGATE_TO_AGENT_TOOL_NAME);
            expect(delegateToAgentPublish).toBeUndefined();
        });
    });
});
//# sourceMappingURL=delegate-to-agent-tool.test.js.map