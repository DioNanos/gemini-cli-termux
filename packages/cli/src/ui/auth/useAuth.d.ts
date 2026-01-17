/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoadedSettings } from '../../config/settings.js';
import { AuthType, type Config } from '@google/gemini-cli-core';
import { AuthState } from '../types.js';
export declare function validateAuthMethodWithSettings(authType: AuthType, settings: LoadedSettings): string | null;
export declare const useAuthCommand: (settings: LoadedSettings, config: Config) => {
    authState: AuthState;
    setAuthState: import("react").Dispatch<import("react").SetStateAction<AuthState>>;
    authError: string | null;
    onAuthError: (error: string | null) => void;
    apiKeyDefaultValue: string | undefined;
    reloadApiKey: () => Promise<string>;
};
