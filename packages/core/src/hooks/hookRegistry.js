/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { HookEventName, ConfigSource, HOOKS_CONFIG_FIELDS } from './types.js';
import { debugLogger } from '../utils/debugLogger.js';
import { TrustedHooksManager } from './trustedHooks.js';
import { coreEvents } from '../utils/events.js';
/**
 * Hook registry that loads and validates hook definitions from multiple sources
 */
export class HookRegistry {
    config;
    entries = [];
    constructor(config) {
        this.config = config;
    }
    /**
     * Initialize the registry by processing hooks from config
     */
    async initialize() {
        this.entries = [];
        this.processHooksFromConfig();
        debugLogger.log(`Hook registry initialized with ${this.entries.length} hook entries`);
    }
    /**
     * Get all hook entries for a specific event
     */
    getHooksForEvent(eventName) {
        return this.entries
            .filter((entry) => entry.eventName === eventName && entry.enabled)
            .sort((a, b) => this.getSourcePriority(a.source) - this.getSourcePriority(b.source));
    }
    /**
     * Get all registered hooks
     */
    getAllHooks() {
        return [...this.entries];
    }
    /**
     * Enable or disable a specific hook
     */
    setHookEnabled(hookName, enabled) {
        const updated = this.entries.filter((entry) => {
            const name = this.getHookName(entry);
            if (name === hookName) {
                entry.enabled = enabled;
                return true;
            }
            return false;
        });
        if (updated.length > 0) {
            debugLogger.log(`${enabled ? 'Enabled' : 'Disabled'} ${updated.length} hook(s) matching "${hookName}"`);
        }
        else {
            debugLogger.warn(`No hooks found matching "${hookName}"`);
        }
    }
    /**
     * Get hook name for identification and display purposes
     */
    getHookName(entry) {
        return entry.config.name || entry.config.command || 'unknown-command';
    }
    /**
     * Check for untrusted project hooks and warn the user
     */
    checkProjectHooksTrust() {
        const projectHooks = this.config.getProjectHooks();
        if (!projectHooks)
            return;
        try {
            const trustedHooksManager = new TrustedHooksManager();
            const untrusted = trustedHooksManager.getUntrustedHooks(this.config.getProjectRoot(), projectHooks);
            if (untrusted.length > 0) {
                const message = `WARNING: The following project-level hooks have been detected in this workspace:
${untrusted.map((h) => `  - ${h}`).join('\n')}

These hooks will be executed. If you did not configure these hooks or do not trust this project,
please review the project settings (.gemini/settings.json) and remove them.`;
                coreEvents.emitFeedback('warning', message);
                // Trust them so we don't warn again
                trustedHooksManager.trustHooks(this.config.getProjectRoot(), projectHooks);
            }
        }
        catch (error) {
            debugLogger.warn('Failed to check project hooks trust', error);
        }
    }
    /**
     * Process hooks from the config that was already loaded by the CLI
     */
    processHooksFromConfig() {
        if (this.config.isTrustedFolder()) {
            this.checkProjectHooksTrust();
        }
        // Get hooks from the main config (this comes from the merged settings)
        const configHooks = this.config.getHooks();
        if (configHooks) {
            if (this.config.isTrustedFolder()) {
                this.processHooksConfiguration(configHooks, ConfigSource.Project);
            }
            else {
                debugLogger.warn('Project hooks disabled because the folder is not trusted.');
            }
        }
        // Get hooks from extensions
        const extensions = this.config.getExtensions() || [];
        for (const extension of extensions) {
            if (extension.isActive && extension.hooks) {
                this.processHooksConfiguration(extension.hooks, ConfigSource.Extensions);
            }
        }
    }
    /**
     * Process hooks configuration and add entries
     */
    processHooksConfiguration(hooksConfig, source) {
        for (const [eventName, definitions] of Object.entries(hooksConfig)) {
            if (HOOKS_CONFIG_FIELDS.includes(eventName)) {
                continue;
            }
            if (!this.isValidEventName(eventName)) {
                coreEvents.emitFeedback('warning', `Invalid hook event name: "${eventName}" from ${source} config. Skipping.`);
                continue;
            }
            const typedEventName = eventName;
            if (!Array.isArray(definitions)) {
                debugLogger.warn(`Hook definitions for event "${eventName}" from source "${source}" is not an array. Skipping.`);
                continue;
            }
            for (const definition of definitions) {
                this.processHookDefinition(definition, typedEventName, source);
            }
        }
    }
    /**
     * Process a single hook definition
     */
    processHookDefinition(definition, eventName, source) {
        if (!definition ||
            typeof definition !== 'object' ||
            !Array.isArray(definition.hooks)) {
            debugLogger.warn(`Discarding invalid hook definition for ${eventName} from ${source}:`, definition);
            return;
        }
        // Get disabled hooks list from settings
        const disabledHooks = this.config.getDisabledHooks() || [];
        for (const hookConfig of definition.hooks) {
            if (hookConfig &&
                typeof hookConfig === 'object' &&
                this.validateHookConfig(hookConfig, eventName, source)) {
                // Check if this hook is in the disabled list
                const hookName = this.getHookName({
                    config: hookConfig,
                });
                const isDisabled = disabledHooks.includes(hookName);
                // Add source to hook config
                hookConfig.source = source;
                this.entries.push({
                    config: hookConfig,
                    source,
                    eventName,
                    matcher: definition.matcher,
                    sequential: definition.sequential,
                    enabled: !isDisabled,
                });
            }
            else {
                // Invalid hooks are logged and discarded here, they won't reach HookRunner
                debugLogger.warn(`Discarding invalid hook configuration for ${eventName} from ${source}:`, hookConfig);
            }
        }
    }
    /**
     * Validate a hook configuration
     */
    validateHookConfig(config, eventName, source) {
        if (!config.type || !['command', 'plugin'].includes(config.type)) {
            debugLogger.warn(`Invalid hook ${eventName} from ${source} type: ${config.type}`);
            return false;
        }
        if (config.type === 'command' && !config.command) {
            debugLogger.warn(`Command hook ${eventName} from ${source} missing command field`);
            return false;
        }
        return true;
    }
    /**
     * Check if an event name is valid
     */
    isValidEventName(eventName) {
        const validEventNames = Object.values(HookEventName);
        return validEventNames.includes(eventName);
    }
    /**
     * Get source priority (lower number = higher priority)
     */
    getSourcePriority(source) {
        switch (source) {
            case ConfigSource.Project:
                return 1;
            case ConfigSource.User:
                return 2;
            case ConfigSource.System:
                return 3;
            case ConfigSource.Extensions:
                return 4;
            default:
                return 999;
        }
    }
}
//# sourceMappingURL=hookRegistry.js.map