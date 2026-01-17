import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi } from 'vitest';
import { AlternateBufferQuittingDisplay } from './AlternateBufferQuittingDisplay.js';
import { ToolCallStatus } from '../types.js';
import { Text } from 'ink';
import { renderWithProviders } from '../../test-utils/render.js';
vi.mock('../utils/terminalSetup.js', () => ({
    getTerminalProgram: () => null,
}));
vi.mock('../contexts/AppContext.js', () => ({
    useAppContext: () => ({
        version: '0.10.0',
    }),
}));
vi.mock('@google/gemini-cli-core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getMCPServerStatus: vi.fn(),
    };
});
vi.mock('../GeminiRespondingSpinner.js', () => ({
    GeminiRespondingSpinner: () => _jsx(Text, { children: "Spinner" }),
}));
const mockHistory = [
    {
        id: 1,
        type: 'tool_group',
        tools: [
            {
                callId: 'call1',
                name: 'tool1',
                description: 'Description for tool 1',
                status: ToolCallStatus.Success,
                resultDisplay: undefined,
                confirmationDetails: undefined,
            },
        ],
    },
    {
        id: 2,
        type: 'tool_group',
        tools: [
            {
                callId: 'call2',
                name: 'tool2',
                description: 'Description for tool 2',
                status: ToolCallStatus.Success,
                resultDisplay: undefined,
                confirmationDetails: undefined,
            },
        ],
    },
];
const mockPendingHistoryItems = [
    {
        type: 'tool_group',
        tools: [
            {
                callId: 'call3',
                name: 'tool3',
                description: 'Description for tool 3',
                status: ToolCallStatus.Pending,
                resultDisplay: undefined,
                confirmationDetails: undefined,
            },
        ],
    },
];
const mockConfig = {
    getScreenReader: () => false,
    getEnableInteractiveShell: () => false,
    getModel: () => 'gemini-pro',
    getTargetDir: () => '/tmp',
    getDebugMode: () => false,
    getGeminiMdFileCount: () => 0,
    getExperiments: () => ({
        flags: {},
        experimentIds: [],
    }),
    getPreviewFeatures: () => false,
};
describe('AlternateBufferQuittingDisplay', () => {
    const baseUIState = {
        terminalWidth: 80,
        mainAreaWidth: 80,
        slashCommands: [],
        activePtyId: undefined,
        embeddedShellFocused: false,
        renderMarkdown: false,
        bannerData: {
            defaultText: '',
            warningText: '',
        },
    };
    it('renders with active and pending tool messages', () => {
        const { lastFrame } = renderWithProviders(_jsx(AlternateBufferQuittingDisplay, {}), {
            uiState: {
                ...baseUIState,
                history: mockHistory,
                pendingHistoryItems: mockPendingHistoryItems,
            },
            config: mockConfig,
        });
        expect(lastFrame()).toMatchSnapshot('with_history_and_pending');
    });
    it('renders with empty history and no pending items', () => {
        const { lastFrame } = renderWithProviders(_jsx(AlternateBufferQuittingDisplay, {}), {
            uiState: {
                ...baseUIState,
                history: [],
                pendingHistoryItems: [],
            },
            config: mockConfig,
        });
        expect(lastFrame()).toMatchSnapshot('empty');
    });
    it('renders with history but no pending items', () => {
        const { lastFrame } = renderWithProviders(_jsx(AlternateBufferQuittingDisplay, {}), {
            uiState: {
                ...baseUIState,
                history: mockHistory,
                pendingHistoryItems: [],
            },
            config: mockConfig,
        });
        expect(lastFrame()).toMatchSnapshot('with_history_no_pending');
    });
    it('renders with pending items but no history', () => {
        const { lastFrame } = renderWithProviders(_jsx(AlternateBufferQuittingDisplay, {}), {
            uiState: {
                ...baseUIState,
                history: [],
                pendingHistoryItems: mockPendingHistoryItems,
            },
            config: mockConfig,
        });
        expect(lastFrame()).toMatchSnapshot('with_pending_no_history');
    });
    it('renders with user and gemini messages', () => {
        const history = [
            { id: 1, type: 'user', text: 'Hello Gemini' },
            { id: 2, type: 'gemini', text: 'Hello User!' },
        ];
        const { lastFrame } = renderWithProviders(_jsx(AlternateBufferQuittingDisplay, {}), {
            uiState: {
                ...baseUIState,
                history,
                pendingHistoryItems: [],
            },
            config: mockConfig,
        });
        expect(lastFrame()).toMatchSnapshot('with_user_gemini_messages');
    });
});
//# sourceMappingURL=AlternateBufferQuittingDisplay.test.js.map