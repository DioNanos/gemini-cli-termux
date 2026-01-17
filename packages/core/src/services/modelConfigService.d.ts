/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentConfig } from '@google/genai';
export interface ModelConfigKey {
    model: string;
    overrideScope?: string;
    isRetry?: boolean;
}
export interface ModelConfig {
    model?: string;
    generateContentConfig?: GenerateContentConfig;
}
export interface ModelConfigOverride {
    match: {
        model?: string;
        overrideScope?: string;
        isRetry?: boolean;
    };
    modelConfig: ModelConfig;
}
export interface ModelConfigAlias {
    extends?: string;
    modelConfig: ModelConfig;
}
export interface ModelConfigServiceConfig {
    aliases?: Record<string, ModelConfigAlias>;
    customAliases?: Record<string, ModelConfigAlias>;
    overrides?: ModelConfigOverride[];
    customOverrides?: ModelConfigOverride[];
}
export type ResolvedModelConfig = _ResolvedModelConfig & {
    readonly _brand: unique symbol;
};
export interface _ResolvedModelConfig {
    model: string;
    generateContentConfig: GenerateContentConfig;
}
export declare class ModelConfigService {
    private readonly config;
    private readonly runtimeAliases;
    private readonly runtimeOverrides;
    constructor(config: ModelConfigServiceConfig);
    registerRuntimeModelConfig(aliasName: string, alias: ModelConfigAlias): void;
    registerRuntimeModelOverride(override: ModelConfigOverride): void;
    /**
     * Resolves a model configuration by merging settings from aliases and applying overrides.
     *
     * The resolution follows a linear application pipeline:
     *
     * 1. Alias Chain Resolution:
     *    Builds the inheritance chain from root to leaf. Configurations are merged starting from
     *    the root, so that children naturally override parents.
     *
     * 2. Override Level Assignment:
     *    Overrides are matched against the hierarchy and assigned a "Level" for application:
     *    - Level 0: Broad matches (Global or Resolved Model name).
     *    - Level 1..N: Hierarchy matches (from Root-most alias to Leaf-most alias).
     *
     * 3. Precedence & Application:
     *    Overrides are applied in order of their Level (ASC), then Specificity (ASC), then
     *    Configuration Order (ASC). This ensures that more targeted and "deeper" rules
     *    naturally layer on top of broader ones.
     *
     * 4. Orthogonality:
     *    All fields (including 'model') are treated equally. A more specific or deeper override
     *    can freely change any setting, including the target model name.
     */
    private internalGetResolvedConfig;
    private resolveAliasChain;
    private buildModelLevelMap;
    private findMatchingOverrides;
    private sortOverrides;
    getResolvedConfig(context: ModelConfigKey): ResolvedModelConfig;
    static isObject(item: unknown): item is Record<string, unknown>;
    /**
     * Merges an override `ModelConfig` into a base `ModelConfig`.
     * The override's model name takes precedence if provided.
     * The `generateContentConfig` properties are deeply merged.
     */
    static merge(base: ModelConfig, override: ModelConfig): ModelConfig;
    static deepMerge(config1: GenerateContentConfig | undefined, config2: GenerateContentConfig | undefined): GenerateContentConfig;
    private static genericDeepMerge;
}
