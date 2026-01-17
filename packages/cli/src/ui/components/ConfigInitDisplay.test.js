import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { act } from 'react';
import { render } from '../../test-utils/render.js';
import { waitFor } from '../../test-utils/async.js';
import { ConfigInitDisplay } from './ConfigInitDisplay.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppEvent } from '../../utils/events.js';
import { MCPServerStatus } from '@google/gemini-cli-core';
import { Text } from 'ink';
// Mock GeminiSpinner
vi.mock('./GeminiRespondingSpinner.js', () => ({
    GeminiSpinner: () => _jsx(Text, { children: "Spinner" }),
}));
// Mock appEvents
const { mockOn, mockOff, mockEmit } = vi.hoisted(() => ({
    mockOn: vi.fn(),
    mockOff: vi.fn(),
    mockEmit: vi.fn(),
}));
vi.mock('../../utils/events.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        appEvents: {
            on: mockOn,
            off: mockOff,
            emit: mockEmit,
        },
    };
});
describe('ConfigInitDisplay', () => {
    beforeEach(() => {
        mockOn.mockClear();
        mockOff.mockClear();
        mockEmit.mockClear();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('renders initial state', () => {
        const { lastFrame } = render(_jsx(ConfigInitDisplay, {}));
        expect(lastFrame()).toMatchSnapshot();
    });
    it('updates message on McpClientUpdate event', async () => {
        let listener;
        mockOn.mockImplementation((event, fn) => {
            if (event === AppEvent.McpClientUpdate) {
                listener = fn;
            }
        });
        const { lastFrame } = render(_jsx(ConfigInitDisplay, {}));
        // Wait for listener to be registered
        await waitFor(() => {
            if (!listener)
                throw new Error('Listener not registered yet');
        });
        const mockClient1 = {
            getStatus: () => MCPServerStatus.CONNECTED,
        };
        const mockClient2 = {
            getStatus: () => MCPServerStatus.CONNECTING,
        };
        const clients = new Map([
            ['server1', mockClient1],
            ['server2', mockClient2],
        ]);
        // Trigger the listener manually since we mocked the event emitter
        act(() => {
            listener(clients);
        });
        // Wait for the UI to update
        await waitFor(() => {
            expect(lastFrame()).toMatchSnapshot();
        });
    });
    it('truncates list of waiting servers if too many', async () => {
        let listener;
        mockOn.mockImplementation((event, fn) => {
            if (event === AppEvent.McpClientUpdate) {
                listener = fn;
            }
        });
        const { lastFrame } = render(_jsx(ConfigInitDisplay, {}));
        await waitFor(() => {
            if (!listener)
                throw new Error('Listener not registered yet');
        });
        const mockClientConnecting = {
            getStatus: () => MCPServerStatus.CONNECTING,
        };
        const clients = new Map([
            ['s1', mockClientConnecting],
            ['s2', mockClientConnecting],
            ['s3', mockClientConnecting],
            ['s4', mockClientConnecting],
            ['s5', mockClientConnecting],
        ]);
        act(() => {
            listener(clients);
        });
        await waitFor(() => {
            expect(lastFrame()).toMatchSnapshot();
        });
    });
    it('handles empty clients map', async () => {
        let listener;
        mockOn.mockImplementation((event, fn) => {
            if (event === AppEvent.McpClientUpdate) {
                listener = fn;
            }
        });
        const { lastFrame } = render(_jsx(ConfigInitDisplay, {}));
        await waitFor(() => {
            if (!listener)
                throw new Error('Listener not registered yet');
        });
        if (listener) {
            const safeListener = listener;
            act(() => {
                safeListener(new Map());
            });
        }
        await waitFor(() => {
            expect(lastFrame()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=ConfigInitDisplay.test.js.map