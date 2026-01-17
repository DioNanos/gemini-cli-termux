/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { IdeClient, IdeConnectionEvent, IdeConnectionType, logIdeConnection, StartSessionEvent, logCliConfiguration, startupProfiler, } from '@google/gemini-cli-core';
import {} from '../config/settings.js';
import { performInitialAuth } from './auth.js';
import { validateTheme } from './theme.js';
/**
 * Orchestrates the application's startup initialization.
 * This runs BEFORE the React UI is rendered.
 * @param config The application config.
 * @param settings The loaded application settings.
 * @returns The results of the initialization.
 */
export async function initializeApp(config, settings) {
    const authHandle = startupProfiler.start('authenticate');
    const authError = await performInitialAuth(config, settings.merged.security.auth.selectedType);
    authHandle?.end();
    const themeError = validateTheme(settings);
    const shouldOpenAuthDialog = settings.merged.security.auth.selectedType === undefined || !!authError;
    logCliConfiguration(config, new StartSessionEvent(config, config.getToolRegistry()));
    if (config.getIdeMode()) {
        const ideClient = await IdeClient.getInstance();
        await ideClient.connect();
        logIdeConnection(config, new IdeConnectionEvent(IdeConnectionType.START));
    }
    return {
        authError,
        themeError,
        shouldOpenAuthDialog,
        geminiMdFileCount: config.getGeminiMdFileCount(),
    };
}
//# sourceMappingURL=initializer.js.map