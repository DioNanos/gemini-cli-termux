import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '../../test-utils/render.js';
import { Text } from 'ink';
import { StatusDisplay } from './StatusDisplay.js';
import { UIStateContext } from '../contexts/UIStateContext.js';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { SettingsContext } from '../contexts/SettingsContext.js';
// Mock child components to simplify testing
vi.mock('./ContextSummaryDisplay.js', () => ({
    ContextSummaryDisplay: (props) => (_jsxs(Text, { children: ["Mock Context Summary Display (Skills: ", props.skillCount, ")"] })),
}));
vi.mock('./HookStatusDisplay.js', () => ({
    HookStatusDisplay: () => _jsx(Text, { children: "Mock Hook Status Display" }),
}));
// Create mock context providers
const createMockUIState = (overrides = {}) => ({
    ctrlCPressedOnce: false,
    warningMessage: null,
    ctrlDPressedOnce: false,
    showEscapePrompt: false,
    queueErrorMessage: null,
    activeHooks: [],
    ideContextState: null,
    geminiMdFileCount: 0,
    contextFileNames: [],
    ...overrides,
});
const createMockConfig = (overrides = {}) => ({
    getMcpClientManager: vi.fn().mockImplementation(() => ({
        getBlockedMcpServers: vi.fn(() => []),
        getMcpServers: vi.fn(() => ({})),
    })),
    getSkillManager: vi.fn().mockImplementation(() => ({
        getSkills: vi.fn(() => ['skill1', 'skill2']),
        getDisplayableSkills: vi.fn(() => ['skill1', 'skill2']),
    })),
    ...overrides,
});
const createMockSettings = (merged = {}) => ({
    merged: {
        hooks: { notifications: true },
        ui: { hideContextSummary: false },
        ...merged,
    },
});
/* eslint-disable @typescript-eslint/no-explicit-any */
const renderStatusDisplay = (props = { hideContextSummary: false }, uiState = createMockUIState(), settings = createMockSettings(), config = createMockConfig()) => render(_jsx(ConfigContext.Provider, { value: config, children: _jsx(SettingsContext.Provider, { value: settings, children: _jsx(UIStateContext.Provider, { value: uiState, children: _jsx(StatusDisplay, { ...props }) }) }) }));
/* eslint-enable @typescript-eslint/no-explicit-any */
describe('StatusDisplay', () => {
    const originalEnv = process.env;
    afterEach(() => {
        process.env = { ...originalEnv };
        delete process.env['GEMINI_SYSTEM_MD'];
    });
    it('renders nothing by default if context summary is hidden via props', () => {
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: true });
        expect(lastFrame()).toBe('');
    });
    it('renders ContextSummaryDisplay by default', () => {
        const { lastFrame } = renderStatusDisplay();
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders system md indicator if env var is set', () => {
        process.env['GEMINI_SYSTEM_MD'] = 'true';
        const { lastFrame } = renderStatusDisplay();
        expect(lastFrame()).toMatchSnapshot();
    });
    it('prioritizes Ctrl+C prompt over everything else (except system md)', () => {
        const uiState = createMockUIState({
            ctrlCPressedOnce: true,
            warningMessage: 'Warning',
            activeHooks: [{ name: 'hook', eventName: 'event' }],
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders warning message', () => {
        const uiState = createMockUIState({
            warningMessage: 'This is a warning',
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('prioritizes warning over Ctrl+D', () => {
        const uiState = createMockUIState({
            warningMessage: 'Warning',
            ctrlDPressedOnce: true,
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders Ctrl+D prompt', () => {
        const uiState = createMockUIState({
            ctrlDPressedOnce: true,
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders Escape prompt', () => {
        const uiState = createMockUIState({
            showEscapePrompt: true,
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders Queue Error Message', () => {
        const uiState = createMockUIState({
            queueErrorMessage: 'Queue Error',
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('renders HookStatusDisplay when hooks are active', () => {
        const uiState = createMockUIState({
            activeHooks: [{ name: 'hook', eventName: 'event' }],
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('does NOT render HookStatusDisplay if notifications are disabled in settings', () => {
        const uiState = createMockUIState({
            activeHooks: [{ name: 'hook', eventName: 'event' }],
        });
        const settings = createMockSettings({
            hooks: { notifications: false },
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, uiState, settings);
        expect(lastFrame()).toMatchSnapshot();
    });
    it('hides ContextSummaryDisplay if configured in settings', () => {
        const settings = createMockSettings({
            ui: { hideContextSummary: true },
        });
        const { lastFrame } = renderStatusDisplay({ hideContextSummary: false }, undefined, settings);
        expect(lastFrame()).toBe('');
    });
});
//# sourceMappingURL=StatusDisplay.test.js.map