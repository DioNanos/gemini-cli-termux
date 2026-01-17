/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const MAX_ALIAS_CHAIN_DEPTH = 100;
export class ModelConfigService {
    config;
    runtimeAliases = {};
    runtimeOverrides = [];
    // TODO(12597): Process config to build a typed alias hierarchy.
    constructor(config) {
        this.config = config;
    }
    registerRuntimeModelConfig(aliasName, alias) {
        this.runtimeAliases[aliasName] = alias;
    }
    registerRuntimeModelOverride(override) {
        this.runtimeOverrides.push(override);
    }
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
    internalGetResolvedConfig(context) {
        const { aliases = {}, customAliases = {}, overrides = [], customOverrides = [], } = this.config || {};
        const allAliases = {
            ...aliases,
            ...customAliases,
            ...this.runtimeAliases,
        };
        const { aliasChain, baseModel, resolvedConfig } = this.resolveAliasChain(context.model, allAliases);
        const modelToLevel = this.buildModelLevelMap(aliasChain, baseModel);
        const allOverrides = [
            ...overrides,
            ...customOverrides,
            ...this.runtimeOverrides,
        ];
        const matches = this.findMatchingOverrides(allOverrides, context, modelToLevel);
        this.sortOverrides(matches);
        let currentConfig = {
            model: baseModel,
            generateContentConfig: resolvedConfig,
        };
        for (const match of matches) {
            currentConfig = ModelConfigService.merge(currentConfig, match.modelConfig);
        }
        return {
            model: currentConfig.model,
            generateContentConfig: currentConfig.generateContentConfig ?? {},
        };
    }
    resolveAliasChain(requestedModel, allAliases) {
        const aliasChain = [];
        if (allAliases[requestedModel]) {
            let current = requestedModel;
            const visited = new Set();
            while (current) {
                const alias = allAliases[current];
                if (!alias) {
                    throw new Error(`Alias "${current}" not found.`);
                }
                if (visited.size >= MAX_ALIAS_CHAIN_DEPTH) {
                    throw new Error(`Alias inheritance chain exceeded maximum depth of ${MAX_ALIAS_CHAIN_DEPTH}.`);
                }
                if (visited.has(current)) {
                    throw new Error(`Circular alias dependency: ${[...visited, current].join(' -> ')}`);
                }
                visited.add(current);
                aliasChain.push(current);
                current = alias.extends;
            }
            // Root-to-Leaf chain for merging and level assignment.
            const reversedChain = [...aliasChain].reverse();
            let resolvedConfig = {};
            for (const aliasName of reversedChain) {
                const alias = allAliases[aliasName];
                resolvedConfig = ModelConfigService.merge(resolvedConfig, alias.modelConfig);
            }
            return {
                aliasChain: reversedChain,
                baseModel: resolvedConfig.model,
                resolvedConfig: resolvedConfig.generateContentConfig ?? {},
            };
        }
        return {
            aliasChain: [requestedModel],
            baseModel: requestedModel,
            resolvedConfig: {},
        };
    }
    buildModelLevelMap(aliasChain, baseModel) {
        const modelToLevel = new Map();
        // Global and Model name are both level 0.
        if (baseModel) {
            modelToLevel.set(baseModel, 0);
        }
        // Alias chain starts at level 1.
        aliasChain.forEach((name, i) => modelToLevel.set(name, i + 1));
        return modelToLevel;
    }
    findMatchingOverrides(overrides, context, modelToLevel) {
        return overrides
            .map((override, index) => {
            const matchEntries = Object.entries(override.match);
            if (matchEntries.length === 0)
                return null;
            let matchedLevel = 0; // Default to Global
            const isMatch = matchEntries.every(([key, value]) => {
                if (key === 'model') {
                    const level = modelToLevel.get(value);
                    if (level === undefined)
                        return false;
                    matchedLevel = level;
                    return true;
                }
                if (key === 'overrideScope' && value === 'core') {
                    return context.overrideScope === 'core' || !context.overrideScope;
                }
                return context[key] === value;
            });
            return isMatch
                ? {
                    specificity: matchEntries.length,
                    level: matchedLevel,
                    modelConfig: override.modelConfig,
                    index,
                }
                : null;
        })
            .filter((m) => m !== null);
    }
    sortOverrides(matches) {
        matches.sort((a, b) => {
            if (a.level !== b.level) {
                return a.level - b.level;
            }
            if (a.specificity !== b.specificity) {
                return a.specificity - b.specificity;
            }
            return a.index - b.index;
        });
    }
    getResolvedConfig(context) {
        const resolved = this.internalGetResolvedConfig(context);
        if (!resolved.model) {
            throw new Error(`Could not resolve a model name for alias "${context.model}". Please ensure the alias chain or a matching override specifies a model.`);
        }
        return {
            model: resolved.model,
            generateContentConfig: resolved.generateContentConfig,
        };
    }
    static isObject(item) {
        return !!item && typeof item === 'object' && !Array.isArray(item);
    }
    /**
     * Merges an override `ModelConfig` into a base `ModelConfig`.
     * The override's model name takes precedence if provided.
     * The `generateContentConfig` properties are deeply merged.
     */
    static merge(base, override) {
        return {
            model: override.model ?? base.model,
            generateContentConfig: ModelConfigService.deepMerge(base.generateContentConfig, override.generateContentConfig),
        };
    }
    static deepMerge(config1, config2) {
        return ModelConfigService.genericDeepMerge(config1, config2);
    }
    static genericDeepMerge(...objects) {
        return objects.reduce((acc, obj) => {
            if (!obj) {
                return acc;
            }
            Object.keys(obj).forEach((key) => {
                const accValue = acc[key];
                const objValue = obj[key];
                // For now, we only deep merge objects, and not arrays. This is because
                // If we deep merge arrays, there is no way for the user to completely
                // override the base array.
                // TODO(joshualitt): Consider knobs here, i.e. opt-in to deep merging
                // arrays on a case-by-case basis.
                if (ModelConfigService.isObject(accValue) &&
                    ModelConfigService.isObject(objValue)) {
                    acc[key] = ModelConfigService.genericDeepMerge(accValue, objValue);
                }
                else {
                    acc[key] = objValue;
                }
            });
            return acc;
        }, {});
    }
}
//# sourceMappingURL=modelConfigService.js.map