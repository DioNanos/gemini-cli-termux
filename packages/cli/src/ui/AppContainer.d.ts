/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config, type ResumedSessionData } from '@google/gemini-cli-core';
import { type InitializationResult } from '../core/initializer.js';
interface AppContainerProps {
    config: Config;
    startupWarnings?: string[];
    version: string;
    initializationResult: InitializationResult;
    resumedSessionData?: ResumedSessionData;
}
export declare const AppContainer: (props: AppContainerProps) => import("react/jsx-runtime").JSX.Element;
export {};
