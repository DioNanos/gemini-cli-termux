/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi } from 'vitest';
import { getMCPServerPrompts } from './mcp-prompts.js';
import { PromptRegistry } from './prompt-registry.js';
describe('getMCPServerPrompts', () => {
    it('should return prompts from the registry for a given server', () => {
        const mockPrompts = [
            {
                name: 'prompt1',
                serverName: 'server1',
                invoke: async () => ({
                    messages: [
                        { role: 'assistant', content: { type: 'text', text: '' } },
                    ],
                }),
            },
        ];
        const mockRegistry = new PromptRegistry();
        vi.spyOn(mockRegistry, 'getPromptsByServer').mockReturnValue(mockPrompts);
        const mockConfig = {
            getPromptRegistry: () => mockRegistry,
        };
        const result = getMCPServerPrompts(mockConfig, 'server1');
        expect(mockRegistry.getPromptsByServer).toHaveBeenCalledWith('server1');
        expect(result).toEqual(mockPrompts);
    });
    it('should return an empty array if there is no prompt registry', () => {
        const mockConfig = {
            getPromptRegistry: () => undefined,
        };
        const result = getMCPServerPrompts(mockConfig, 'server1');
        expect(result).toEqual([]);
    });
});
//# sourceMappingURL=mcp-prompts.test.js.map