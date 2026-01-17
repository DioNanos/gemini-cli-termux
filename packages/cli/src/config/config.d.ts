/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Config, type HookDefinition, type HookEventName } from '@google/gemini-cli-core';
import { type MergedSettings } from './settings.js';
import { RESUME_LATEST } from '../utils/sessionUtils.js';
export interface CliArgs {
    query: string | undefined;
    model: string | undefined;
    sandbox: boolean | string | undefined;
    debug: boolean | undefined;
    prompt: string | undefined;
    promptInteractive: string | undefined;
    yolo: boolean | undefined;
    approvalMode: string | undefined;
    allowedMcpServerNames: string[] | undefined;
    allowedTools: string[] | undefined;
    experimentalAcp: boolean | undefined;
    extensions: string[] | undefined;
    listExtensions: boolean | undefined;
    resume: string | typeof RESUME_LATEST | undefined;
    listSessions: boolean | undefined;
    deleteSession: string | undefined;
    includeDirectories: string[] | undefined;
    screenReader: boolean | undefined;
    useWriteTodos: boolean | undefined;
    outputFormat: string | undefined;
    fakeResponses: string | undefined;
    recordResponses: string | undefined;
}
export declare function parseArguments(settings: MergedSettings): Promise<CliArgs>;
export declare function isDebugMode(argv: CliArgs): boolean;
export interface LoadCliConfigOptions {
    cwd?: string;
    projectHooks?: {
        [K in HookEventName]?: HookDefinition[];
    } & {
        disabled?: string[];
    };
}
export declare function loadCliConfig(settings: MergedSettings, sessionId: string, argv: CliArgs, options?: LoadCliConfigOptions): Promise<Config>;
