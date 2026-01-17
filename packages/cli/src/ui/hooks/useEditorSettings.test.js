import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest';
import { act } from 'react';
import { render } from '../../test-utils/render.js';
import { useEditorSettings } from './useEditorSettings.js';
import { SettingScope } from '../../config/settings.js';
import { MessageType } from '../types.js';
import { checkHasEditorType, allowEditorTypeInSandbox, } from '@google/gemini-cli-core';
import { SettingPaths } from '../../config/settingPaths.js';
vi.mock('@google/gemini-cli-core', async () => {
    const actual = await vi.importActual('@google/gemini-cli-core');
    return {
        ...actual,
        checkHasEditorType: vi.fn(() => true),
        allowEditorTypeInSandbox: vi.fn(() => true),
    };
});
const mockCheckHasEditorType = vi.mocked(checkHasEditorType);
const mockAllowEditorTypeInSandbox = vi.mocked(allowEditorTypeInSandbox);
describe('useEditorSettings', () => {
    let mockLoadedSettings;
    let mockSetEditorError;
    let mockAddItem;
    let result;
    function TestComponent() {
        result = useEditorSettings(mockLoadedSettings, mockSetEditorError, mockAddItem);
        return null;
    }
    beforeEach(() => {
        vi.resetAllMocks();
        mockLoadedSettings = {
            setValue: vi.fn(),
        };
        mockSetEditorError = vi.fn();
        mockAddItem = vi.fn();
        // Reset mock implementations to default
        mockCheckHasEditorType.mockReturnValue(true);
        mockAllowEditorTypeInSandbox.mockReturnValue(true);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('should initialize with dialog closed', () => {
        render(_jsx(TestComponent, {}));
        expect(result.isEditorDialogOpen).toBe(false);
    });
    it('should open editor dialog when openEditorDialog is called', () => {
        render(_jsx(TestComponent, {}));
        act(() => {
            result.openEditorDialog();
        });
        expect(result.isEditorDialogOpen).toBe(true);
    });
    it('should close editor dialog when exitEditorDialog is called', () => {
        render(_jsx(TestComponent, {}));
        act(() => {
            result.openEditorDialog();
            result.exitEditorDialog();
        });
        expect(result.isEditorDialogOpen).toBe(false);
    });
    it('should handle editor selection successfully', () => {
        render(_jsx(TestComponent, {}));
        const editorType = 'vscode';
        const scope = SettingScope.User;
        act(() => {
            result.openEditorDialog();
            result.handleEditorSelect(editorType, scope);
        });
        expect(mockLoadedSettings.setValue).toHaveBeenCalledWith(scope, SettingPaths.General.PreferredEditor, editorType);
        expect(mockAddItem).toHaveBeenCalledWith({
            type: MessageType.INFO,
            text: 'Editor preference set to "VS Code" in User settings.',
        }, expect.any(Number));
        expect(mockSetEditorError).toHaveBeenCalledWith(null);
        expect(result.isEditorDialogOpen).toBe(false);
    });
    it('should handle clearing editor preference (undefined editor)', () => {
        render(_jsx(TestComponent, {}));
        const scope = SettingScope.Workspace;
        act(() => {
            result.openEditorDialog();
            result.handleEditorSelect(undefined, scope);
        });
        expect(mockLoadedSettings.setValue).toHaveBeenCalledWith(scope, SettingPaths.General.PreferredEditor, undefined);
        expect(mockAddItem).toHaveBeenCalledWith({
            type: MessageType.INFO,
            text: 'Editor preference cleared in Workspace settings.',
        }, expect.any(Number));
        expect(mockSetEditorError).toHaveBeenCalledWith(null);
        expect(result.isEditorDialogOpen).toBe(false);
    });
    it('should handle different editor types', () => {
        render(_jsx(TestComponent, {}));
        const editorTypes = ['cursor', 'windsurf', 'vim'];
        const displayNames = {
            cursor: 'Cursor',
            windsurf: 'Windsurf',
            vim: 'Vim',
        };
        const scope = SettingScope.User;
        editorTypes.forEach((editorType) => {
            act(() => {
                result.handleEditorSelect(editorType, scope);
            });
            expect(mockLoadedSettings.setValue).toHaveBeenCalledWith(scope, SettingPaths.General.PreferredEditor, editorType);
            expect(mockAddItem).toHaveBeenCalledWith({
                type: MessageType.INFO,
                text: `Editor preference set to "${displayNames[editorType]}" in User settings.`,
            }, expect.any(Number));
        });
    });
    it('should handle different setting scopes', () => {
        render(_jsx(TestComponent, {}));
        const editorType = 'vscode';
        const scopes = [
            SettingScope.User,
            SettingScope.Workspace,
        ];
        scopes.forEach((scope) => {
            act(() => {
                result.handleEditorSelect(editorType, scope);
            });
            expect(mockLoadedSettings.setValue).toHaveBeenCalledWith(scope, SettingPaths.General.PreferredEditor, editorType);
            expect(mockAddItem).toHaveBeenCalledWith({
                type: MessageType.INFO,
                text: `Editor preference set to "VS Code" in ${scope} settings.`,
            }, expect.any(Number));
        });
    });
    it('should not set preference for unavailable editors', () => {
        render(_jsx(TestComponent, {}));
        mockCheckHasEditorType.mockReturnValue(false);
        const editorType = 'vscode';
        const scope = SettingScope.User;
        act(() => {
            result.openEditorDialog();
            result.handleEditorSelect(editorType, scope);
        });
        expect(mockLoadedSettings.setValue).not.toHaveBeenCalled();
        expect(mockAddItem).not.toHaveBeenCalled();
        expect(result.isEditorDialogOpen).toBe(true);
    });
    it('should not set preference for editors not allowed in sandbox', () => {
        render(_jsx(TestComponent, {}));
        mockAllowEditorTypeInSandbox.mockReturnValue(false);
        const editorType = 'vscode';
        const scope = SettingScope.User;
        act(() => {
            result.openEditorDialog();
            result.handleEditorSelect(editorType, scope);
        });
        expect(mockLoadedSettings.setValue).not.toHaveBeenCalled();
        expect(mockAddItem).not.toHaveBeenCalled();
        expect(result.isEditorDialogOpen).toBe(true);
    });
    it('should handle errors during editor selection', () => {
        render(_jsx(TestComponent, {}));
        const errorMessage = 'Failed to save settings';
        mockLoadedSettings.setValue.mockImplementation(() => {
            throw new Error(errorMessage);
        });
        const editorType = 'vscode';
        const scope = SettingScope.User;
        act(() => {
            result.openEditorDialog();
            result.handleEditorSelect(editorType, scope);
        });
        expect(mockSetEditorError).toHaveBeenCalledWith(`Failed to set editor preference: Error: ${errorMessage}`);
        expect(mockAddItem).not.toHaveBeenCalled();
        expect(result.isEditorDialogOpen).toBe(true);
    });
});
//# sourceMappingURL=useEditorSettings.test.js.map