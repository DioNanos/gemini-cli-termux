/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export type TerminalBackgroundColor = string | undefined;
export declare class TerminalCapabilityManager {
    private static instance;
    private static readonly KITTY_QUERY;
    private static readonly OSC_11_QUERY;
    private static readonly TERMINAL_NAME_QUERY;
    private static readonly DEVICE_ATTRIBUTES_QUERY;
    private static readonly MODIFY_OTHER_KEYS_QUERY;
    private static readonly KITTY_REGEX;
    private static readonly TERMINAL_NAME_REGEX;
    private static readonly DEVICE_ATTRIBUTES_REGEX;
    private static readonly OSC_11_REGEX;
    private static readonly MODIFY_OTHER_KEYS_REGEX;
    private detectionComplete;
    private terminalBackgroundColor;
    private kittySupported;
    private kittyEnabled;
    private terminalName;
    private modifyOtherKeysSupported?;
    private deviceAttributesSupported;
    private constructor();
    static getInstance(): TerminalCapabilityManager;
    static resetInstanceForTesting(): void;
    /**
     * Detects terminal capabilities (Kitty protocol support, terminal name,
     * background color).
     * This should be called once at app startup.
     */
    detectCapabilities(): Promise<void>;
    enableSupportedModes(): void;
    getTerminalBackgroundColor(): TerminalBackgroundColor;
    getTerminalName(): string | undefined;
    isKittyProtocolEnabled(): boolean;
    private parseColor;
}
export declare const terminalCapabilityManager: TerminalCapabilityManager;
