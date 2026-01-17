import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi } from 'vitest';
import { HistoryItemDisplay } from './HistoryItemDisplay.js';
import { ToolCallStatus } from '../types.js';
import { MessageType } from '../types.js';
import { SessionStatsProvider } from '../contexts/SessionContext.js';
import { ToolGroupMessage } from './messages/ToolGroupMessage.js';
import { renderWithProviders } from '../../test-utils/render.js';
// Mock child components
vi.mock('./messages/ToolGroupMessage.js', () => ({
    ToolGroupMessage: vi.fn(() => _jsx("div", {})),
}));
describe('<HistoryItemDisplay />', () => {
    const mockConfig = {};
    const baseItem = {
        id: 1,
        timestamp: 12345,
        isPending: false,
        terminalWidth: 80,
        config: mockConfig,
    };
    it('renders UserMessage for "user" type', () => {
        const item = {
            ...baseItem,
            type: MessageType.USER,
            text: 'Hello',
        };
        const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { ...baseItem, item: item }));
        expect(lastFrame()).toContain('Hello');
    });
    it('renders UserMessage for "user" type with slash command', () => {
        const item = {
            ...baseItem,
            type: MessageType.USER,
            text: '/theme',
        };
        const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { ...baseItem, item: item }));
        expect(lastFrame()).toContain('/theme');
    });
    it.each([true, false])('renders InfoMessage for "info" type with multi-line text (alternateBuffer=%s)', (useAlternateBuffer) => {
        const item = {
            ...baseItem,
            type: MessageType.INFO,
            text: '⚡ Line 1\n⚡ Line 2\n⚡ Line 3',
        };
        const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { ...baseItem, item: item }), { useAlternateBuffer });
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders AgentsStatus for "agents_list" type', () => {
        const item = {
            ...baseItem,
            type: MessageType.AGENTS_LIST,
            agents: [
                {
                    name: 'local_agent',
                    displayName: 'Local Agent',
                    description: '  Local agent description.\n    Second line.',
                    kind: 'local',
                },
                {
                    name: 'remote_agent',
                    description: 'Remote agent description.',
                    kind: 'remote',
                },
            ],
        };
        const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { ...baseItem, item: item }));
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders StatsDisplay for "stats" type', () => {
        const item = {
            ...baseItem,
            type: MessageType.STATS,
            duration: '1s',
        };
        const { lastFrame } = renderWithProviders(_jsx(SessionStatsProvider, { children: _jsx(HistoryItemDisplay, { ...baseItem, item: item }) }));
        expect(lastFrame()).toContain('Stats');
    });
    it('renders AboutBox for "about" type', () => {
        const item = {
            ...baseItem,
            type: MessageType.ABOUT,
            cliVersion: '1.0.0',
            osVersion: 'test-os',
            sandboxEnv: 'test-env',
            modelVersion: 'test-model',
            selectedAuthType: 'test-auth',
            gcpProject: 'test-project',
            ideClient: 'test-ide',
        };
        const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { ...baseItem, item: item }));
        expect(lastFrame()).toContain('About Gemini CLI');
    });
    it('renders ModelStatsDisplay for "model_stats" type', () => {
        const item = {
            ...baseItem,
            type: 'model_stats',
        };
        const { lastFrame } = renderWithProviders(_jsx(SessionStatsProvider, { children: _jsx(HistoryItemDisplay, { ...baseItem, item: item }) }));
        expect(lastFrame()).toContain('No API calls have been made in this session.');
    });
    it('renders ToolStatsDisplay for "tool_stats" type', () => {
        const item = {
            ...baseItem,
            type: 'tool_stats',
        };
        const { lastFrame } = renderWithProviders(_jsx(SessionStatsProvider, { children: _jsx(HistoryItemDisplay, { ...baseItem, item: item }) }));
        expect(lastFrame()).toContain('No tool calls have been made in this session.');
    });
    it('renders SessionSummaryDisplay for "quit" type', () => {
        const item = {
            ...baseItem,
            type: 'quit',
            duration: '1s',
        };
        const { lastFrame } = renderWithProviders(_jsx(SessionStatsProvider, { children: _jsx(HistoryItemDisplay, { ...baseItem, item: item }) }));
        expect(lastFrame()).toContain('Agent powering down. Goodbye!');
    });
    it('should escape ANSI codes in text content', () => {
        const historyItem = {
            id: 1,
            type: 'user',
            text: 'Hello, \u001b[31mred\u001b[0m world!',
        };
        const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { item: historyItem, terminalWidth: 80, isPending: false }));
        // The ANSI codes should be escaped for display.
        expect(lastFrame()).toContain('Hello, \\u001b[31mred\\u001b[0m world!');
        // The raw ANSI codes should not be present.
        expect(lastFrame()).not.toContain('Hello, \u001b[31mred\u001b[0m world!');
    });
    it('should escape ANSI codes in tool confirmation details', () => {
        const historyItem = {
            id: 1,
            type: 'tool_group',
            tools: [
                {
                    callId: '123',
                    name: 'run_shell_command',
                    description: 'Run a shell command',
                    resultDisplay: 'blank',
                    status: ToolCallStatus.Confirming,
                    confirmationDetails: {
                        type: 'exec',
                        title: 'Run Shell Command',
                        command: 'echo "\u001b[31mhello\u001b[0m"',
                        rootCommand: 'echo',
                        rootCommands: ['echo'],
                        onConfirm: async () => { },
                    },
                },
            ],
        };
        renderWithProviders(_jsx(HistoryItemDisplay, { item: historyItem, terminalWidth: 80, isPending: false }));
        const passedProps = vi.mocked(ToolGroupMessage).mock.calls[0][0];
        const confirmationDetails = passedProps.toolCalls[0]
            .confirmationDetails;
        expect(confirmationDetails.command).toBe('echo "\\u001b[31mhello\\u001b[0m"');
    });
    describe.each([true, false])('gemini items (alternateBuffer=%s)', (useAlternateBuffer) => {
        const longCode = '# Example code block:\n' +
            '```python\n' +
            Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join('\n') +
            '\n```';
        it('should render a truncated gemini item', () => {
            const item = {
                id: 1,
                type: 'gemini',
                text: longCode,
            };
            const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { item: item, isPending: false, terminalWidth: 80, availableTerminalHeight: 10 }), { useAlternateBuffer });
            expect(lastFrame()).toMatchSnapshot();
        });
        it('should render a full gemini item when using availableTerminalHeightGemini', () => {
            const item = {
                id: 1,
                type: 'gemini',
                text: longCode,
            };
            const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { item: item, isPending: false, terminalWidth: 80, availableTerminalHeight: 10, availableTerminalHeightGemini: Number.MAX_SAFE_INTEGER }), { useAlternateBuffer });
            expect(lastFrame()).toMatchSnapshot();
        });
        it('should render a truncated gemini_content item', () => {
            const item = {
                id: 1,
                type: 'gemini_content',
                text: longCode,
            };
            const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { item: item, isPending: false, terminalWidth: 80, availableTerminalHeight: 10 }), { useAlternateBuffer });
            expect(lastFrame()).toMatchSnapshot();
        });
        it('should render a full gemini_content item when using availableTerminalHeightGemini', () => {
            const item = {
                id: 1,
                type: 'gemini_content',
                text: longCode,
            };
            const { lastFrame } = renderWithProviders(_jsx(HistoryItemDisplay, { item: item, isPending: false, terminalWidth: 80, availableTerminalHeight: 10, availableTerminalHeightGemini: Number.MAX_SAFE_INTEGER }), { useAlternateBuffer });
            expect(lastFrame()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=HistoryItemDisplay.test.js.map