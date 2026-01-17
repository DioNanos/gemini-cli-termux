import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { renderWithProviders } from '../../test-utils/render.js';
import { DialogManager } from './DialogManager.js';
import { describe, it, expect, vi } from 'vitest';
import { Text } from 'ink';
import {} from '../contexts/UIStateContext.js';
import {} from '../hooks/useIdeTrustListener.js';
import {} from '@google/gemini-cli-core';
// Mock child components
vi.mock('../IdeIntegrationNudge.js', () => ({
    IdeIntegrationNudge: () => _jsx(Text, { children: "IdeIntegrationNudge" }),
}));
vi.mock('./LoopDetectionConfirmation.js', () => ({
    LoopDetectionConfirmation: () => _jsx(Text, { children: "LoopDetectionConfirmation" }),
}));
vi.mock('./FolderTrustDialog.js', () => ({
    FolderTrustDialog: () => _jsx(Text, { children: "FolderTrustDialog" }),
}));
vi.mock('./ConsentPrompt.js', () => ({
    ConsentPrompt: () => _jsx(Text, { children: "ConsentPrompt" }),
}));
vi.mock('./ThemeDialog.js', () => ({
    ThemeDialog: () => _jsx(Text, { children: "ThemeDialog" }),
}));
vi.mock('./SettingsDialog.js', () => ({
    SettingsDialog: () => _jsx(Text, { children: "SettingsDialog" }),
}));
vi.mock('../auth/AuthInProgress.js', () => ({
    AuthInProgress: () => _jsx(Text, { children: "AuthInProgress" }),
}));
vi.mock('../auth/AuthDialog.js', () => ({
    AuthDialog: () => _jsx(Text, { children: "AuthDialog" }),
}));
vi.mock('../auth/ApiAuthDialog.js', () => ({
    ApiAuthDialog: () => _jsx(Text, { children: "ApiAuthDialog" }),
}));
vi.mock('./EditorSettingsDialog.js', () => ({
    EditorSettingsDialog: () => _jsx(Text, { children: "EditorSettingsDialog" }),
}));
vi.mock('../privacy/PrivacyNotice.js', () => ({
    PrivacyNotice: () => _jsx(Text, { children: "PrivacyNotice" }),
}));
vi.mock('./ProQuotaDialog.js', () => ({
    ProQuotaDialog: () => _jsx(Text, { children: "ProQuotaDialog" }),
}));
vi.mock('./PermissionsModifyTrustDialog.js', () => ({
    PermissionsModifyTrustDialog: () => _jsx(Text, { children: "PermissionsModifyTrustDialog" }),
}));
vi.mock('./ModelDialog.js', () => ({
    ModelDialog: () => _jsx(Text, { children: "ModelDialog" }),
}));
vi.mock('./IdeTrustChangeDialog.js', () => ({
    IdeTrustChangeDialog: () => _jsx(Text, { children: "IdeTrustChangeDialog" }),
}));
describe('DialogManager', () => {
    const defaultProps = {
        addItem: vi.fn(),
        terminalWidth: 100,
    };
    const baseUiState = {
        constrainHeight: false,
        terminalHeight: 24,
        staticExtraHeight: 0,
        mainAreaWidth: 80,
        confirmUpdateExtensionRequests: [],
        showIdeRestartPrompt: false,
        proQuotaRequest: null,
        shouldShowIdePrompt: false,
        isFolderTrustDialogOpen: false,
        loopDetectionConfirmationRequest: null,
        confirmationRequest: null,
        isThemeDialogOpen: false,
        isSettingsDialogOpen: false,
        isModelDialogOpen: false,
        isAuthenticating: false,
        isAwaitingApiKeyInput: false,
        isAuthDialogOpen: false,
        isEditorDialogOpen: false,
        showPrivacyNotice: false,
        isPermissionsDialogOpen: false,
    };
    it('renders nothing by default', () => {
        const { lastFrame } = renderWithProviders(_jsx(DialogManager, { ...defaultProps }), 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { uiState: baseUiState });
        expect(lastFrame()).toBe('');
    });
    const testCases = [
        [
            {
                showIdeRestartPrompt: true,
                ideTrustRestartReason: 'update',
            },
            'IdeTrustChangeDialog',
        ],
        [
            {
                proQuotaRequest: {
                    failedModel: 'a',
                    fallbackModel: 'b',
                    message: 'c',
                    isTerminalQuotaError: false,
                    resolve: vi.fn(),
                },
            },
            'ProQuotaDialog',
        ],
        [
            {
                shouldShowIdePrompt: true,
                currentIDE: { name: 'vscode', version: '1.0' },
            },
            'IdeIntegrationNudge',
        ],
        [{ isFolderTrustDialogOpen: true }, 'FolderTrustDialog'],
        [
            { loopDetectionConfirmationRequest: { onComplete: vi.fn() } },
            'LoopDetectionConfirmation',
        ],
        [
            { confirmationRequest: { prompt: 'foo', onConfirm: vi.fn() } },
            'ConsentPrompt',
        ],
        [
            {
                confirmUpdateExtensionRequests: [{ prompt: 'foo', onConfirm: vi.fn() }],
            },
            'ConsentPrompt',
        ],
        [{ isThemeDialogOpen: true }, 'ThemeDialog'],
        [{ isSettingsDialogOpen: true }, 'SettingsDialog'],
        [{ isModelDialogOpen: true }, 'ModelDialog'],
        [{ isAuthenticating: true }, 'AuthInProgress'],
        [{ isAwaitingApiKeyInput: true }, 'ApiAuthDialog'],
        [{ isAuthDialogOpen: true }, 'AuthDialog'],
        [{ isEditorDialogOpen: true }, 'EditorSettingsDialog'],
        [{ showPrivacyNotice: true }, 'PrivacyNotice'],
        [{ isPermissionsDialogOpen: true }, 'PermissionsModifyTrustDialog'],
    ];
    it.each(testCases)('renders %s when state is %o', (uiStateOverride, expectedComponent) => {
        const { lastFrame } = renderWithProviders(_jsx(DialogManager, { ...defaultProps }), {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            uiState: { ...baseUiState, ...uiStateOverride },
        });
        expect(lastFrame()).toContain(expectedComponent);
    });
});
//# sourceMappingURL=DialogManager.test.js.map