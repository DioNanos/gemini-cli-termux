/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export type EnvironmentSanitizationConfig = {
    allowedEnvironmentVariables: string[];
    blockedEnvironmentVariables: string[];
    enableEnvironmentVariableRedaction: boolean;
};
export declare function sanitizeEnvironment(processEnv: NodeJS.ProcessEnv, config: EnvironmentSanitizationConfig): NodeJS.ProcessEnv;
export declare const ALWAYS_ALLOWED_ENVIRONMENT_VARIABLES: ReadonlySet<string>;
export declare const NEVER_ALLOWED_ENVIRONMENT_VARIABLES: ReadonlySet<string>;
export declare const NEVER_ALLOWED_NAME_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
export declare const NEVER_ALLOWED_VALUE_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
