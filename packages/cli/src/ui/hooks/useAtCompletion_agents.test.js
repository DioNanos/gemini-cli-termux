/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useState } from 'react';
import { renderHook } from '../../test-utils/render.js';
import { waitFor } from '../../test-utils/async.js';
import { useAtCompletion } from './useAtCompletion.js';
import { createTmpDir, cleanupTmpDir } from '@google/gemini-cli-test-utils';
import { CommandKind } from '../commands/types.js';
// Test harness to capture the state from the hook's callbacks.
function useTestHarnessForAtCompletion(enabled, pattern, config, cwd) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    useAtCompletion({
        enabled,
        pattern,
        config,
        cwd,
        setSuggestions,
        setIsLoadingSuggestions,
    });
    return { suggestions, isLoadingSuggestions };
}
describe('useAtCompletion with Agents', () => {
    let testRootDir;
    let mockConfig;
    beforeEach(() => {
        const mockAgentRegistry = {
            getAllDefinitions: vi.fn(() => [
                {
                    name: 'CodebaseInvestigator',
                    description: 'Investigates codebase',
                    kind: 'local',
                },
                {
                    name: 'OtherAgent',
                    description: 'Another agent',
                    kind: 'local',
                },
            ]),
        };
        mockConfig = {
            getFileFilteringOptions: vi.fn(() => ({
                respectGitIgnore: true,
                respectGeminiIgnore: true,
            })),
            getEnableRecursiveFileSearch: () => true,
            getFileFilteringDisableFuzzySearch: () => false,
            getFileFilteringEnableFuzzySearch: () => true,
            getAgentsSettings: () => ({}),
            getResourceRegistry: vi.fn().mockReturnValue({
                getAllResources: () => [],
            }),
            getAgentRegistry: () => mockAgentRegistry,
        };
        vi.clearAllMocks();
    });
    afterEach(async () => {
        if (testRootDir) {
            await cleanupTmpDir(testRootDir);
        }
        vi.restoreAllMocks();
    });
    it('should include agent suggestions', async () => {
        testRootDir = await createTmpDir({});
        const { result } = renderHook(() => useTestHarnessForAtCompletion(true, '', mockConfig, testRootDir));
        await waitFor(() => {
            expect(result.current.suggestions.length).toBeGreaterThan(0);
        });
        const agentSuggestion = result.current.suggestions.find((s) => s.value === 'CodebaseInvestigator');
        expect(agentSuggestion).toBeDefined();
        expect(agentSuggestion?.commandKind).toBe(CommandKind.AGENT);
    });
    it('should filter agent suggestions', async () => {
        testRootDir = await createTmpDir({});
        const { result } = renderHook(() => useTestHarnessForAtCompletion(true, 'Code', mockConfig, testRootDir));
        await waitFor(() => {
            expect(result.current.suggestions.length).toBeGreaterThan(0);
        });
        expect(result.current.suggestions.map((s) => s.value)).toContain('CodebaseInvestigator');
        expect(result.current.suggestions.map((s) => s.value)).not.toContain('OtherAgent');
    });
});
//# sourceMappingURL=useAtCompletion_agents.test.js.map