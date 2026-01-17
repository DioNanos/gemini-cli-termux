/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach, } from 'vitest';
import { act } from 'react';
import { renderHook } from '../../test-utils/render.js';
import { useAutoAcceptIndicator } from './useAutoAcceptIndicator.js';
import { Config, ApprovalMode } from '@google/gemini-cli-core';
import { useKeypress } from './useKeypress.js';
import { MessageType } from '../types.js';
vi.mock('./useKeypress.js');
vi.mock('@google/gemini-cli-core', async () => {
    const actualServerModule = await vi.importActual('@google/gemini-cli-core');
    return {
        ...actualServerModule,
        Config: vi.fn(),
    };
});
describe('useAutoAcceptIndicator', () => {
    let mockConfigInstance;
    let capturedUseKeypressHandler;
    let mockedUseKeypress;
    beforeEach(() => {
        vi.resetAllMocks();
        Config.mockImplementation(() => {
            const instanceGetApprovalModeMock = vi.fn();
            const instanceSetApprovalModeMock = vi.fn();
            const instance = {
                getApprovalMode: instanceGetApprovalModeMock,
                setApprovalMode: instanceSetApprovalModeMock,
                isYoloModeDisabled: vi.fn().mockReturnValue(false),
                isTrustedFolder: vi.fn().mockReturnValue(true),
                getCoreTools: vi.fn().mockReturnValue([]),
                getToolDiscoveryCommand: vi.fn().mockReturnValue(undefined),
                getTargetDir: vi.fn().mockReturnValue('.'),
                getApiKey: vi.fn().mockReturnValue('test-api-key'),
                getModel: vi.fn().mockReturnValue('test-model'),
                getSandbox: vi.fn().mockReturnValue(false),
                getDebugMode: vi.fn().mockReturnValue(false),
                getQuestion: vi.fn().mockReturnValue(undefined),
                getUserAgent: vi.fn().mockReturnValue('test-user-agent'),
                getUserMemory: vi.fn().mockReturnValue(''),
                getGeminiMdFileCount: vi.fn().mockReturnValue(0),
                getToolRegistry: vi
                    .fn()
                    .mockReturnValue({ discoverTools: vi.fn() }),
            };
            instanceSetApprovalModeMock.mockImplementation((value) => {
                instanceGetApprovalModeMock.mockReturnValue(value);
            });
            return instance;
        });
        mockedUseKeypress = useKeypress;
        mockedUseKeypress.mockImplementation((handler, _options) => {
            capturedUseKeypressHandler = handler;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockConfigInstance = new Config();
    });
    it('should initialize with ApprovalMode.AUTO_EDIT if config.getApprovalMode returns ApprovalMode.AUTO_EDIT', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.AUTO_EDIT);
        const { result } = renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            addItem: vi.fn(),
        }));
        expect(result.current).toBe(ApprovalMode.AUTO_EDIT);
        expect(mockConfigInstance.getApprovalMode).toHaveBeenCalledTimes(1);
    });
    it('should initialize with ApprovalMode.DEFAULT if config.getApprovalMode returns ApprovalMode.DEFAULT', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        const { result } = renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            addItem: vi.fn(),
        }));
        expect(result.current).toBe(ApprovalMode.DEFAULT);
        expect(mockConfigInstance.getApprovalMode).toHaveBeenCalledTimes(1);
    });
    it('should initialize with ApprovalMode.YOLO if config.getApprovalMode returns ApprovalMode.YOLO', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.YOLO);
        const { result } = renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            addItem: vi.fn(),
        }));
        expect(result.current).toBe(ApprovalMode.YOLO);
        expect(mockConfigInstance.getApprovalMode).toHaveBeenCalledTimes(1);
    });
    it('should toggle the indicator and update config when Shift+Tab or Ctrl+Y is pressed', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        const { result } = renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            addItem: vi.fn(),
        }));
        expect(result.current).toBe(ApprovalMode.DEFAULT);
        act(() => {
            capturedUseKeypressHandler({
                name: 'tab',
                shift: true,
            });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.AUTO_EDIT);
        expect(result.current).toBe(ApprovalMode.AUTO_EDIT);
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.YOLO);
        expect(result.current).toBe(ApprovalMode.YOLO);
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.DEFAULT);
        expect(result.current).toBe(ApprovalMode.DEFAULT);
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.YOLO);
        expect(result.current).toBe(ApprovalMode.YOLO);
        act(() => {
            capturedUseKeypressHandler({
                name: 'tab',
                shift: true,
            });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.AUTO_EDIT);
        expect(result.current).toBe(ApprovalMode.AUTO_EDIT);
        act(() => {
            capturedUseKeypressHandler({
                name: 'tab',
                shift: true,
            });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.DEFAULT);
        expect(result.current).toBe(ApprovalMode.DEFAULT);
    });
    it('should not toggle if only one key or other keys combinations are pressed', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            addItem: vi.fn(),
        }));
        act(() => {
            capturedUseKeypressHandler({
                name: 'tab',
                shift: false,
            });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
        act(() => {
            capturedUseKeypressHandler({
                name: 'unknown',
                shift: true,
            });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
        act(() => {
            capturedUseKeypressHandler({
                name: 'a',
                shift: false,
                ctrl: false,
            });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: false });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
        act(() => {
            capturedUseKeypressHandler({ name: 'a', ctrl: true });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
        act(() => {
            capturedUseKeypressHandler({ name: 'y', shift: true });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
        act(() => {
            capturedUseKeypressHandler({
                name: 'a',
                ctrl: true,
                shift: true,
            });
        });
        expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
    });
    it('should update indicator when config value changes externally (useEffect dependency)', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        const { result, rerender } = renderHook((props) => useAutoAcceptIndicator(props), {
            initialProps: {
                config: mockConfigInstance,
                addItem: vi.fn(),
            },
        });
        expect(result.current).toBe(ApprovalMode.DEFAULT);
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.AUTO_EDIT);
        rerender({
            config: mockConfigInstance,
            addItem: vi.fn(),
        });
        expect(result.current).toBe(ApprovalMode.AUTO_EDIT);
        expect(mockConfigInstance.getApprovalMode).toHaveBeenCalledTimes(3);
    });
    describe('in untrusted folders', () => {
        beforeEach(() => {
            mockConfigInstance.isTrustedFolder.mockReturnValue(false);
        });
        it('should not enable YOLO mode when Ctrl+Y is pressed', () => {
            mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
            mockConfigInstance.setApprovalMode.mockImplementation(() => {
                throw new Error('Cannot enable privileged approval modes in an untrusted folder.');
            });
            const mockAddItem = vi.fn();
            const { result } = renderHook(() => useAutoAcceptIndicator({
                config: mockConfigInstance,
                addItem: mockAddItem,
            }));
            expect(result.current).toBe(ApprovalMode.DEFAULT);
            act(() => {
                capturedUseKeypressHandler({ name: 'y', ctrl: true });
            });
            // We expect setApprovalMode to be called, and the error to be caught.
            expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.YOLO);
            expect(mockAddItem).toHaveBeenCalled();
            // Verify the underlying config value was not changed
            expect(mockConfigInstance.getApprovalMode()).toBe(ApprovalMode.DEFAULT);
        });
        it('should not enable AUTO_EDIT mode when Shift+Tab is pressed', () => {
            mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
            mockConfigInstance.setApprovalMode.mockImplementation(() => {
                throw new Error('Cannot enable privileged approval modes in an untrusted folder.');
            });
            const mockAddItem = vi.fn();
            const { result } = renderHook(() => useAutoAcceptIndicator({
                config: mockConfigInstance,
                addItem: mockAddItem,
            }));
            expect(result.current).toBe(ApprovalMode.DEFAULT);
            act(() => {
                capturedUseKeypressHandler({
                    name: 'tab',
                    shift: true,
                });
            });
            // We expect setApprovalMode to be called, and the error to be caught.
            expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.AUTO_EDIT);
            expect(mockAddItem).toHaveBeenCalled();
            // Verify the underlying config value was not changed
            expect(mockConfigInstance.getApprovalMode()).toBe(ApprovalMode.DEFAULT);
        });
        it('should disable YOLO mode when Ctrl+Y is pressed', () => {
            mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.YOLO);
            const mockAddItem = vi.fn();
            renderHook(() => useAutoAcceptIndicator({
                config: mockConfigInstance,
                addItem: mockAddItem,
            }));
            act(() => {
                capturedUseKeypressHandler({ name: 'y', ctrl: true });
            });
            expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.DEFAULT);
            expect(mockConfigInstance.getApprovalMode()).toBe(ApprovalMode.DEFAULT);
        });
        it('should disable AUTO_EDIT mode when Shift+Tab is pressed', () => {
            mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.AUTO_EDIT);
            const mockAddItem = vi.fn();
            renderHook(() => useAutoAcceptIndicator({
                config: mockConfigInstance,
                addItem: mockAddItem,
            }));
            act(() => {
                capturedUseKeypressHandler({
                    name: 'tab',
                    shift: true,
                });
            });
            expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.DEFAULT);
            expect(mockConfigInstance.getApprovalMode()).toBe(ApprovalMode.DEFAULT);
        });
        it('should show a warning when trying to enable privileged modes', () => {
            // Mock the error thrown by setApprovalMode
            const errorMessage = 'Cannot enable privileged approval modes in an untrusted folder.';
            mockConfigInstance.setApprovalMode.mockImplementation(() => {
                throw new Error(errorMessage);
            });
            const mockAddItem = vi.fn();
            renderHook(() => useAutoAcceptIndicator({
                config: mockConfigInstance,
                addItem: mockAddItem,
            }));
            // Try to enable YOLO mode
            act(() => {
                capturedUseKeypressHandler({ name: 'y', ctrl: true });
            });
            expect(mockAddItem).toHaveBeenCalledWith({
                type: MessageType.INFO,
                text: errorMessage,
            }, expect.any(Number));
            // Try to enable AUTO_EDIT mode
            act(() => {
                capturedUseKeypressHandler({
                    name: 'tab',
                    shift: true,
                });
            });
            expect(mockAddItem).toHaveBeenCalledWith({
                type: MessageType.INFO,
                text: errorMessage,
            }, expect.any(Number));
            expect(mockAddItem).toHaveBeenCalledTimes(2);
        });
    });
    describe('when YOLO mode is disabled by settings', () => {
        beforeEach(() => {
            // Ensure isYoloModeDisabled returns true for these tests
            if (mockConfigInstance && mockConfigInstance.isYoloModeDisabled) {
                mockConfigInstance.isYoloModeDisabled.mockReturnValue(true);
            }
        });
        it('should not enable YOLO mode when Ctrl+Y is pressed and add an info message', () => {
            mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
            const mockAddItem = vi.fn();
            const { result } = renderHook(() => useAutoAcceptIndicator({
                config: mockConfigInstance,
                addItem: mockAddItem,
            }));
            expect(result.current).toBe(ApprovalMode.DEFAULT);
            act(() => {
                capturedUseKeypressHandler({ name: 'y', ctrl: true });
            });
            // setApprovalMode should not be called because the check should return early
            expect(mockConfigInstance.setApprovalMode).not.toHaveBeenCalled();
            // An info message should be added
            expect(mockAddItem).toHaveBeenCalledWith({
                type: MessageType.WARNING,
                text: 'You cannot enter YOLO mode since it is disabled in your settings.',
            }, expect.any(Number));
            // The mode should not change
            expect(result.current).toBe(ApprovalMode.DEFAULT);
        });
    });
    it('should call onApprovalModeChange when switching to YOLO mode', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        const mockOnApprovalModeChange = vi.fn();
        renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            onApprovalModeChange: mockOnApprovalModeChange,
        }));
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.YOLO);
        expect(mockOnApprovalModeChange).toHaveBeenCalledWith(ApprovalMode.YOLO);
    });
    it('should call onApprovalModeChange when switching to AUTO_EDIT mode', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        const mockOnApprovalModeChange = vi.fn();
        renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            onApprovalModeChange: mockOnApprovalModeChange,
        }));
        act(() => {
            capturedUseKeypressHandler({ name: 'tab', shift: true });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.AUTO_EDIT);
        expect(mockOnApprovalModeChange).toHaveBeenCalledWith(ApprovalMode.AUTO_EDIT);
    });
    it('should call onApprovalModeChange when switching to DEFAULT mode', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.YOLO);
        const mockOnApprovalModeChange = vi.fn();
        renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            onApprovalModeChange: mockOnApprovalModeChange,
        }));
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true }); // This should toggle from YOLO to DEFAULT
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.DEFAULT);
        expect(mockOnApprovalModeChange).toHaveBeenCalledWith(ApprovalMode.DEFAULT);
    });
    it('should not call onApprovalModeChange when callback is not provided', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
        }));
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true });
        });
        expect(mockConfigInstance.setApprovalMode).toHaveBeenCalledWith(ApprovalMode.YOLO);
        // Should not throw an error when callback is not provided
    });
    it('should handle multiple mode changes correctly', () => {
        mockConfigInstance.getApprovalMode.mockReturnValue(ApprovalMode.DEFAULT);
        const mockOnApprovalModeChange = vi.fn();
        renderHook(() => useAutoAcceptIndicator({
            config: mockConfigInstance,
            onApprovalModeChange: mockOnApprovalModeChange,
        }));
        // Switch to YOLO
        act(() => {
            capturedUseKeypressHandler({ name: 'y', ctrl: true });
        });
        // Switch to AUTO_EDIT
        act(() => {
            capturedUseKeypressHandler({ name: 'tab', shift: true });
        });
        expect(mockOnApprovalModeChange).toHaveBeenCalledTimes(2);
        expect(mockOnApprovalModeChange).toHaveBeenNthCalledWith(1, ApprovalMode.YOLO);
        expect(mockOnApprovalModeChange).toHaveBeenNthCalledWith(2, ApprovalMode.AUTO_EDIT);
    });
});
//# sourceMappingURL=useAutoAcceptIndicator.test.js.map