import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ToolMessage } from './ToolMessage.js';
import { StreamingState, ToolCallStatus } from '../../types.js';
import { Text } from 'ink';
import { StreamingContext } from '../../contexts/StreamingContext.js';
import { renderWithProviders } from '../../../test-utils/render.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../TerminalOutput.js', () => ({
    TerminalOutput: function MockTerminalOutput({ cursor, }) {
        return (_jsxs(Text, { children: ["MockCursor:(", cursor?.x, ",", cursor?.y, ")"] }));
    },
}));
vi.mock('../AnsiOutput.js', () => ({
    AnsiOutputText: function MockAnsiOutputText({ data }) {
        // Simple serialization for snapshot stability
        const serialized = data
            .map((line) => line.map((token) => token.text || '').join(''))
            .join('\n');
        return _jsxs(Text, { children: ["MockAnsiOutput:", serialized] });
    },
}));
// Mock child components or utilities if they are complex or have side effects
vi.mock('../GeminiRespondingSpinner.js', () => ({
    GeminiRespondingSpinner: ({ nonRespondingDisplay, }) => {
        const streamingState = React.useContext(StreamingContext);
        if (streamingState === StreamingState.Responding) {
            return _jsx(Text, { children: "MockRespondingSpinner" });
        }
        return nonRespondingDisplay ? _jsx(Text, { children: nonRespondingDisplay }) : null;
    },
}));
vi.mock('./DiffRenderer.js', () => ({
    DiffRenderer: function MockDiffRenderer({ diffContent, }) {
        return _jsxs(Text, { children: ["MockDiff:", diffContent] });
    },
}));
vi.mock('../../utils/MarkdownDisplay.js', () => ({
    MarkdownDisplay: function MockMarkdownDisplay({ text }) {
        return _jsxs(Text, { children: ["MockMarkdown:", text] });
    },
}));
describe('<ToolMessage />', () => {
    const baseProps = {
        callId: 'tool-123',
        name: 'test-tool',
        description: 'A tool for testing',
        resultDisplay: 'Test result',
        status: ToolCallStatus.Success,
        terminalWidth: 80,
        confirmationDetails: undefined,
        emphasis: 'medium',
        isFirst: true,
        borderColor: 'green',
        borderDimColor: false,
    };
    const mockSetEmbeddedShellFocused = vi.fn();
    const uiActions = {
        setEmbeddedShellFocused: mockSetEmbeddedShellFocused,
    };
    // Helper to render with context
    const renderWithContext = (ui, streamingState) => renderWithProviders(ui, {
        uiActions,
        uiState: { streamingState },
    });
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders basic tool information', () => {
        const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps }), StreamingState.Idle);
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
    describe('ToolStatusIndicator rendering', () => {
        it('shows ✓ for Success status', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Success }), StreamingState.Idle);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows o for Pending status', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Pending }), StreamingState.Idle);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows ? for Confirming status', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Confirming }), StreamingState.Idle);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows - for Canceled status', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Canceled }), StreamingState.Idle);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows x for Error status', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Error }), StreamingState.Idle);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows paused spinner for Executing status when streamingState is Idle', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Executing }), StreamingState.Idle);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows paused spinner for Executing status when streamingState is WaitingForConfirmation', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Executing }), StreamingState.WaitingForConfirmation);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('shows MockRespondingSpinner for Executing status when streamingState is Responding', () => {
            const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, status: ToolCallStatus.Executing }), StreamingState.Responding);
            expect(lastFrame()).toMatchSnapshot();
        });
    });
    it('renders DiffRenderer for diff results', () => {
        const diffResult = {
            fileDiff: '--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-old\n+new',
            fileName: 'file.txt',
            originalContent: 'old',
            newContent: 'new',
            filePath: 'file.txt',
        };
        const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, resultDisplay: diffResult }), StreamingState.Idle);
        // Check that the output contains the MockDiff content as part of the whole message
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders emphasis correctly', () => {
        const { lastFrame: highEmphasisFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, emphasis: "high" }), StreamingState.Idle);
        // Check for trailing indicator or specific color if applicable (Colors are not easily testable here)
        expect(highEmphasisFrame()).toMatchSnapshot();
        const { lastFrame: lowEmphasisFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, emphasis: "low" }), StreamingState.Idle);
        // For low emphasis, the name and description might be dimmed (check for dimColor if possible)
        // This is harder to assert directly in text output without color checks.
        // We can at least ensure it doesn't have the high emphasis indicator.
        expect(lowEmphasisFrame()).toMatchSnapshot();
    });
    it('renders AnsiOutputText for AnsiOutput results', () => {
        const ansiResult = [
            [
                {
                    text: 'hello',
                    fg: '#ffffff',
                    bg: '#000000',
                    bold: false,
                    italic: false,
                    underline: false,
                    dim: false,
                    inverse: false,
                },
            ],
        ];
        const { lastFrame } = renderWithContext(_jsx(ToolMessage, { ...baseProps, resultDisplay: ansiResult }), StreamingState.Idle);
        expect(lastFrame()).toMatchSnapshot();
    });
});
//# sourceMappingURL=ToolMessage.test.js.map