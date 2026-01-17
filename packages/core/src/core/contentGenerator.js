/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { loadApiKey } from './apiKeyCredentialStorage.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';
import { InstallationManager } from '../utils/installationManager.js';
import { FakeContentGenerator } from './fakeContentGenerator.js';
import { parseCustomHeaders } from '../utils/customHeaderUtils.js';
import { RecordingContentGenerator } from './recordingContentGenerator.js';
import { getVersion, resolveModel } from '../../index.js';
export var AuthType;
(function (AuthType) {
    AuthType["LOGIN_WITH_GOOGLE"] = "oauth-personal";
    AuthType["USE_GEMINI"] = "gemini-api-key";
    AuthType["USE_VERTEX_AI"] = "vertex-ai";
    AuthType["LEGACY_CLOUD_SHELL"] = "cloud-shell";
    AuthType["COMPUTE_ADC"] = "compute-default-credentials";
})(AuthType || (AuthType = {}));
export async function createContentGeneratorConfig(config, authType) {
    const geminiApiKey = process.env['GEMINI_API_KEY'] || (await loadApiKey()) || undefined;
    const googleApiKey = process.env['GOOGLE_API_KEY'] || undefined;
    const googleCloudProject = process.env['GOOGLE_CLOUD_PROJECT'] ||
        process.env['GOOGLE_CLOUD_PROJECT_ID'] ||
        undefined;
    const googleCloudLocation = process.env['GOOGLE_CLOUD_LOCATION'] || undefined;
    const contentGeneratorConfig = {
        authType,
        proxy: config?.getProxy(),
    };
    // If we are using Google auth or we are in Cloud Shell, there is nothing else to validate for now
    if (authType === AuthType.LOGIN_WITH_GOOGLE ||
        authType === AuthType.COMPUTE_ADC) {
        return contentGeneratorConfig;
    }
    if (authType === AuthType.USE_GEMINI && geminiApiKey) {
        contentGeneratorConfig.apiKey = geminiApiKey;
        contentGeneratorConfig.vertexai = false;
        return contentGeneratorConfig;
    }
    if (authType === AuthType.USE_VERTEX_AI &&
        (googleApiKey || (googleCloudProject && googleCloudLocation))) {
        contentGeneratorConfig.apiKey = googleApiKey;
        contentGeneratorConfig.vertexai = true;
        return contentGeneratorConfig;
    }
    return contentGeneratorConfig;
}
export async function createContentGenerator(config, gcConfig, sessionId) {
    const generator = await (async () => {
        if (gcConfig.fakeResponses) {
            const fakeGenerator = await FakeContentGenerator.fromFile(gcConfig.fakeResponses);
            return new LoggingContentGenerator(fakeGenerator, gcConfig);
        }
        const version = await getVersion();
        const model = resolveModel(gcConfig.getModel(), gcConfig.getPreviewFeatures());
        const customHeadersEnv = process.env['GEMINI_CLI_CUSTOM_HEADERS'] || undefined;
        const userAgent = `GeminiCLI/${version}/${model} (${process.platform}; ${process.arch})`;
        const customHeadersMap = parseCustomHeaders(customHeadersEnv);
        const apiKeyAuthMechanism = process.env['GEMINI_API_KEY_AUTH_MECHANISM'] || 'x-goog-api-key';
        const baseHeaders = {
            ...customHeadersMap,
            'User-Agent': userAgent,
        };
        if (apiKeyAuthMechanism === 'bearer' &&
            (config.authType === AuthType.USE_GEMINI ||
                config.authType === AuthType.USE_VERTEX_AI) &&
            config.apiKey) {
            baseHeaders['Authorization'] = `Bearer ${config.apiKey}`;
        }
        if (config.authType === AuthType.LOGIN_WITH_GOOGLE ||
            config.authType === AuthType.COMPUTE_ADC) {
            const httpOptions = { headers: baseHeaders };
            return new LoggingContentGenerator(await createCodeAssistContentGenerator(httpOptions, config.authType, gcConfig, sessionId), gcConfig);
        }
        if (config.authType === AuthType.USE_GEMINI ||
            config.authType === AuthType.USE_VERTEX_AI) {
            let headers = { ...baseHeaders };
            if (gcConfig?.getUsageStatisticsEnabled()) {
                const installationManager = new InstallationManager();
                const installationId = installationManager.getInstallationId();
                headers = {
                    ...headers,
                    'x-gemini-api-privileged-user-id': `${installationId}`,
                };
            }
            const httpOptions = { headers };
            const googleGenAI = new GoogleGenAI({
                apiKey: config.apiKey === '' ? undefined : config.apiKey,
                vertexai: config.vertexai,
                httpOptions,
            });
            return new LoggingContentGenerator(googleGenAI.models, gcConfig);
        }
        throw new Error(`Error creating contentGenerator: Unsupported authType: ${config.authType}`);
    })();
    if (gcConfig.recordResponses) {
        return new RecordingContentGenerator(generator, gcConfig.recordResponses);
    }
    return generator;
}
//# sourceMappingURL=contentGenerator.js.map