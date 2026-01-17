import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render as inkRender } from 'ink-testing-library';
import { Box } from 'ink';
import { vi } from 'vitest';
import { act, useState } from 'react';
import { LoadedSettings } from '../config/settings.js';
import { KeypressProvider } from '../ui/contexts/KeypressContext.js';
import { SettingsContext } from '../ui/contexts/SettingsContext.js';
import { ShellFocusContext } from '../ui/contexts/ShellFocusContext.js';
import { UIStateContext } from '../ui/contexts/UIStateContext.js';
import { StreamingState } from '../ui/types.js';
import { ConfigContext } from '../ui/contexts/ConfigContext.js';
import { calculateMainAreaWidth } from '../ui/utils/ui-sizing.js';
import { VimModeProvider } from '../ui/contexts/VimModeContext.js';
import { MouseProvider } from '../ui/contexts/MouseContext.js';
import { ScrollProvider } from '../ui/contexts/ScrollProvider.js';
import { StreamingContext } from '../ui/contexts/StreamingContext.js';
import { UIActionsContext, } from '../ui/contexts/UIActionsContext.js';
import {} from '@google/gemini-cli-core';
// Wrapper around ink-testing-library's render that ensures act() is called
export const render = (tree, terminalWidth) => {
    let renderResult = undefined;
    act(() => {
        renderResult = inkRender(tree);
    });
    if (terminalWidth !== undefined && renderResult?.stdout) {
        // Override the columns getter on the stdout instance provided by ink-testing-library
        Object.defineProperty(renderResult.stdout, 'columns', {
            get: () => terminalWidth,
            configurable: true,
        });
        // Trigger a rerender so Ink can pick up the new terminal width
        act(() => {
            renderResult.rerender(tree);
        });
    }
    const originalUnmount = renderResult.unmount;
    const originalRerender = renderResult.rerender;
    return {
        ...renderResult,
        unmount: () => {
            act(() => {
                originalUnmount();
            });
        },
        rerender: (newTree) => {
            act(() => {
                originalRerender(newTree);
            });
        },
    };
};
export const simulateClick = async (stdin, col, row, button = 0) => {
    // Terminal mouse events are 1-based, so convert if necessary.
    const mouseEventString = `\x1b[<${button};${col};${row}M`;
    await act(async () => {
        stdin.write(mouseEventString);
    });
};
const mockConfig = {
    getModel: () => 'gemini-pro',
    getTargetDir: () => '/Users/test/project/foo/bar/and/some/more/directories/to/make/it/long',
    getDebugMode: () => false,
    isTrustedFolder: () => true,
    getIdeMode: () => false,
    getEnableInteractiveShell: () => true,
    getPreviewFeatures: () => false,
};
const configProxy = new Proxy(mockConfig, {
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        }
        throw new Error(`mockConfig does not have property ${String(prop)}`);
    },
});
export const mockSettings = new LoadedSettings({ path: '', settings: {}, originalSettings: {} }, { path: '', settings: {}, originalSettings: {} }, { path: '', settings: {}, originalSettings: {} }, { path: '', settings: {}, originalSettings: {} }, true, []);
export const createMockSettings = (overrides) => {
    const settings = overrides;
    return new LoadedSettings({ path: '', settings: {}, originalSettings: {} }, { path: '', settings: {}, originalSettings: {} }, { path: '', settings, originalSettings: settings }, { path: '', settings: {}, originalSettings: {} }, true, []);
};
// A minimal mock UIState to satisfy the context provider.
// Tests that need specific UIState values should provide their own.
const baseMockUiState = {
    renderMarkdown: true,
    streamingState: StreamingState.Idle,
    mainAreaWidth: 100,
    terminalWidth: 120,
    terminalHeight: 40,
    currentModel: 'gemini-pro',
    terminalBackgroundColor: undefined,
};
const mockUIActions = {
    handleThemeSelect: vi.fn(),
    closeThemeDialog: vi.fn(),
    handleThemeHighlight: vi.fn(),
    handleAuthSelect: vi.fn(),
    setAuthState: vi.fn(),
    onAuthError: vi.fn(),
    handleEditorSelect: vi.fn(),
    exitEditorDialog: vi.fn(),
    exitPrivacyNotice: vi.fn(),
    closeSettingsDialog: vi.fn(),
    closeModelDialog: vi.fn(),
    openPermissionsDialog: vi.fn(),
    openSessionBrowser: vi.fn(),
    closeSessionBrowser: vi.fn(),
    handleResumeSession: vi.fn(),
    handleDeleteSession: vi.fn(),
    closePermissionsDialog: vi.fn(),
    setShellModeActive: vi.fn(),
    vimHandleInput: vi.fn(),
    handleIdePromptComplete: vi.fn(),
    handleFolderTrustSelect: vi.fn(),
    setConstrainHeight: vi.fn(),
    onEscapePromptChange: vi.fn(),
    refreshStatic: vi.fn(),
    handleFinalSubmit: vi.fn(),
    handleClearScreen: vi.fn(),
    handleProQuotaChoice: vi.fn(),
    setQueueErrorMessage: vi.fn(),
    popAllMessages: vi.fn(),
    handleApiKeySubmit: vi.fn(),
    handleApiKeyCancel: vi.fn(),
    setBannerVisible: vi.fn(),
    setEmbeddedShellFocused: vi.fn(),
    setAuthContext: vi.fn(),
    handleRestart: vi.fn(),
};
export const renderWithProviders = (component, { shellFocus = true, settings = mockSettings, uiState: providedUiState, width, mouseEventsEnabled = false, config = configProxy, useAlternateBuffer = true, uiActions, } = {}) => {
    const baseState = new Proxy({ ...baseMockUiState, ...providedUiState }, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            }
            // For properties not in the base mock or provided state,
            // we'll check the original proxy to see if it's a defined but
            // unprovided property, and if not, throw.
            if (prop in baseMockUiState) {
                return baseMockUiState[prop];
            }
            throw new Error(`mockUiState does not have property ${String(prop)}`);
        },
    });
    const terminalWidth = width ?? baseState.terminalWidth;
    let finalSettings = settings;
    if (useAlternateBuffer !== undefined) {
        finalSettings = createMockSettings({
            ...settings.merged,
            ui: {
                ...settings.merged.ui,
                useAlternateBuffer,
            },
        });
    }
    const mainAreaWidth = calculateMainAreaWidth(terminalWidth, finalSettings);
    const finalUiState = {
        ...baseState,
        terminalWidth,
        mainAreaWidth,
    };
    const finalUIActions = { ...mockUIActions, ...uiActions };
    const renderResult = render(_jsx(ConfigContext.Provider, { value: config, children: _jsx(SettingsContext.Provider, { value: finalSettings, children: _jsx(UIStateContext.Provider, { value: finalUiState, children: _jsx(VimModeProvider, { settings: finalSettings, children: _jsx(ShellFocusContext.Provider, { value: shellFocus, children: _jsx(StreamingContext.Provider, { value: finalUiState.streamingState, children: _jsx(UIActionsContext.Provider, { value: finalUIActions, children: _jsx(KeypressProvider, { children: _jsx(MouseProvider, { mouseEventsEnabled: mouseEventsEnabled, children: _jsx(ScrollProvider, { children: _jsx(Box, { width: terminalWidth, flexShrink: 0, flexGrow: 0, flexDirection: "column", children: component }) }) }) }) }) }) }) }) }) }) }), terminalWidth);
    return { ...renderResult, simulateClick };
};
export function renderHook(renderCallback, options) {
    const result = { current: undefined };
    let currentProps = options?.initialProps;
    function TestComponent({ renderCallback, props, }) {
        result.current = renderCallback(props);
        return null;
    }
    const Wrapper = options?.wrapper || (({ children }) => _jsx(_Fragment, { children: children }));
    let inkRerender = () => { };
    let unmount = () => { };
    act(() => {
        const renderResult = render(_jsx(Wrapper, { children: _jsx(TestComponent, { renderCallback: renderCallback, props: currentProps }) }));
        inkRerender = renderResult.rerender;
        unmount = renderResult.unmount;
    });
    function rerender(props) {
        if (arguments.length > 0) {
            currentProps = props;
        }
        act(() => {
            inkRerender(_jsx(Wrapper, { children: _jsx(TestComponent, { renderCallback: renderCallback, props: currentProps }) }));
        });
    }
    return { result, rerender, unmount };
}
export function renderHookWithProviders(renderCallback, options = {}) {
    const result = { current: undefined };
    let setPropsFn;
    function TestComponent({ initialProps }) {
        const [props, setProps] = useState(initialProps);
        setPropsFn = setProps;
        result.current = renderCallback(props);
        return null;
    }
    const Wrapper = options.wrapper || (({ children }) => _jsx(_Fragment, { children: children }));
    let renderResult;
    act(() => {
        renderResult = renderWithProviders(_jsx(Wrapper, { children: _jsx(TestComponent, { initialProps: options.initialProps }) }), options);
    });
    function rerender(newProps) {
        act(() => {
            if (setPropsFn && newProps) {
                setPropsFn(newProps);
            }
        });
    }
    return {
        result,
        rerender,
        unmount: () => {
            act(() => {
                renderResult.unmount();
            });
        },
    };
}
//# sourceMappingURL=render.js.map