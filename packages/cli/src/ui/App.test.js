import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '../test-utils/render.js';
import { Text, useIsScreenReaderEnabled } from 'ink';
import { makeFakeConfig } from '@google/gemini-cli-core';
import { App } from './App.js';
import { UIStateContext } from './contexts/UIStateContext.js';
import { StreamingState } from './types.js';
import { ConfigContext } from './contexts/ConfigContext.js';
import { AppContext } from './contexts/AppContext.js';
import { SettingsContext } from './contexts/SettingsContext.js';
import { LoadedSettings } from '../config/settings.js';
vi.mock('ink', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        useIsScreenReaderEnabled: vi.fn(),
    };
});
vi.mock('./components/MainContent.js', () => ({
    MainContent: () => _jsx(Text, { children: "MainContent" }),
}));
vi.mock('./components/DialogManager.js', () => ({
    DialogManager: () => _jsx(Text, { children: "DialogManager" }),
}));
vi.mock('./components/Composer.js', () => ({
    Composer: () => _jsx(Text, { children: "Composer" }),
}));
vi.mock('./components/Notifications.js', () => ({
    Notifications: () => _jsx(Text, { children: "Notifications" }),
}));
vi.mock('./components/QuittingDisplay.js', () => ({
    QuittingDisplay: () => _jsx(Text, { children: "Quitting..." }),
}));
vi.mock('./components/HistoryItemDisplay.js', () => ({
    HistoryItemDisplay: () => _jsx(Text, { children: "HistoryItemDisplay" }),
}));
vi.mock('./components/Footer.js', () => ({
    Footer: () => _jsx(Text, { children: "Footer" }),
}));
describe('App', () => {
    const mockUIState = {
        streamingState: StreamingState.Idle,
        quittingMessages: null,
        dialogsVisible: false,
        mainControlsRef: { current: null },
        rootUiRef: { current: null },
        historyManager: {
            addItem: vi.fn(),
            history: [],
            updateItem: vi.fn(),
            clearItems: vi.fn(),
            loadHistory: vi.fn(),
        },
        history: [],
        pendingHistoryItems: [],
        bannerData: {
            defaultText: 'Mock Banner Text',
            warningText: '',
        },
    };
    const mockConfig = makeFakeConfig();
    const mockSettingsFile = {
        settings: {},
        originalSettings: {},
        path: '/mock/path',
    };
    const mockLoadedSettings = new LoadedSettings(mockSettingsFile, mockSettingsFile, mockSettingsFile, mockSettingsFile, true, []);
    const mockAppState = {
        version: '1.0.0',
        startupWarnings: [],
    };
    const renderWithProviders = (ui, state) => render(_jsx(AppContext.Provider, { value: mockAppState, children: _jsx(ConfigContext.Provider, { value: mockConfig, children: _jsx(SettingsContext.Provider, { value: mockLoadedSettings, children: _jsx(UIStateContext.Provider, { value: state, children: ui }) }) }) }));
    it('should render main content and composer when not quitting', () => {
        const { lastFrame } = renderWithProviders(_jsx(App, {}), mockUIState);
        expect(lastFrame()).toContain('MainContent');
        expect(lastFrame()).toContain('Notifications');
        expect(lastFrame()).toContain('Composer');
    });
    it('should render quitting display when quittingMessages is set', () => {
        const quittingUIState = {
            ...mockUIState,
            quittingMessages: [{ id: 1, type: 'user', text: 'test' }],
        };
        const { lastFrame } = renderWithProviders(_jsx(App, {}), quittingUIState);
        expect(lastFrame()).toContain('Quitting...');
    });
    it('should render full history in alternate buffer mode when quittingMessages is set', () => {
        const quittingUIState = {
            ...mockUIState,
            quittingMessages: [{ id: 1, type: 'user', text: 'test' }],
            history: [{ id: 1, type: 'user', text: 'history item' }],
            pendingHistoryItems: [{ type: 'user', text: 'pending item' }],
        };
        mockLoadedSettings.merged.ui.useAlternateBuffer = true;
        const { lastFrame } = renderWithProviders(_jsx(App, {}), quittingUIState);
        expect(lastFrame()).toContain('HistoryItemDisplay');
        expect(lastFrame()).toContain('Quitting...');
        // Reset settings
        mockLoadedSettings.merged.ui.useAlternateBuffer = false;
    });
    it('should render dialog manager when dialogs are visible', () => {
        const dialogUIState = {
            ...mockUIState,
            dialogsVisible: true,
        };
        const { lastFrame } = renderWithProviders(_jsx(App, {}), dialogUIState);
        expect(lastFrame()).toContain('MainContent');
        expect(lastFrame()).toContain('Notifications');
        expect(lastFrame()).toContain('DialogManager');
    });
    it.each([
        { key: 'C', stateKey: 'ctrlCPressedOnce' },
        { key: 'D', stateKey: 'ctrlDPressedOnce' },
    ])('should show Ctrl+$key exit prompt when dialogs are visible and $stateKey is true', ({ key, stateKey }) => {
        const uiState = {
            ...mockUIState,
            dialogsVisible: true,
            [stateKey]: true,
        };
        const { lastFrame } = renderWithProviders(_jsx(App, {}), uiState);
        expect(lastFrame()).toContain(`Press Ctrl+${key} again to exit.`);
    });
    it('should render ScreenReaderAppLayout when screen reader is enabled', () => {
        useIsScreenReaderEnabled.mockReturnValue(true);
        const { lastFrame } = renderWithProviders(_jsx(App, {}), mockUIState);
        expect(lastFrame()).toContain('Notifications\nFooter\nMainContent\nComposer');
    });
    it('should render DefaultAppLayout when screen reader is not enabled', () => {
        useIsScreenReaderEnabled.mockReturnValue(false);
        const { lastFrame } = renderWithProviders(_jsx(App, {}), mockUIState);
        expect(lastFrame()).toContain('MainContent\nNotifications\nComposer');
    });
    describe('Snapshots', () => {
        it('renders default layout correctly', () => {
            useIsScreenReaderEnabled.mockReturnValue(false);
            const { lastFrame } = renderWithProviders(_jsx(App, {}), mockUIState);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('renders screen reader layout correctly', () => {
            useIsScreenReaderEnabled.mockReturnValue(true);
            const { lastFrame } = renderWithProviders(_jsx(App, {}), mockUIState);
            expect(lastFrame()).toMatchSnapshot();
        });
        it('renders with dialogs visible', () => {
            const dialogUIState = {
                ...mockUIState,
                dialogsVisible: true,
            };
            const { lastFrame } = renderWithProviders(_jsx(App, {}), dialogUIState);
            expect(lastFrame()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=App.test.js.map