/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config } from '@google/gemini-cli-core';
import type React from 'react';
export declare const BACKSLASH_ENTER_TIMEOUT = 5;
export declare const ESC_TIMEOUT = 50;
export declare const PASTE_TIMEOUT = 30000;
export declare const FAST_RETURN_TIMEOUT = 30;
export interface Key {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    insertable: boolean;
    sequence: string;
}
export type KeypressHandler = (key: Key) => void;
interface KeypressContextValue {
    subscribe: (handler: KeypressHandler) => void;
    unsubscribe: (handler: KeypressHandler) => void;
}
export declare function useKeypressContext(): KeypressContextValue;
export declare function KeypressProvider({ children, config, debugKeystrokeLogging, }: {
    children: React.ReactNode;
    config?: Config;
    debugKeystrokeLogging?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
