/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { getSettingsSchema } from '../config/settingsSchema.js';
import { ExperimentFlags } from '@google/gemini-cli-core';
function flattenSchema(schema, prefix = '') {
    let result = {};
    for (const key in schema) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const definition = schema[key];
        result[newKey] = { ...definition, key: newKey };
        if (definition.properties) {
            result = { ...result, ...flattenSchema(definition.properties, newKey) };
        }
    }
    return result;
}
let _FLATTENED_SCHEMA;
/** Returns a flattened schema, the first call is memoized for future requests. */
export function getFlattenedSchema() {
    return (_FLATTENED_SCHEMA ??
        (_FLATTENED_SCHEMA = flattenSchema(getSettingsSchema())));
}
function clearFlattenedSchema() {
    _FLATTENED_SCHEMA = undefined;
}
/**
 * Get all settings grouped by category
 */
export function getSettingsByCategory() {
    const categories = {};
    Object.values(getFlattenedSchema()).forEach((definition) => {
        const category = definition.category;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(definition);
    });
    return categories;
}
/**
 * Get a setting definition by key
 */
export function getSettingDefinition(key) {
    return getFlattenedSchema()[key];
}
/**
 * Check if a setting requires restart
 */
export function requiresRestart(key) {
    return getFlattenedSchema()[key]?.requiresRestart ?? false;
}
/**
 * Get the default value for a setting
 */
export function getDefaultValue(key) {
    return getFlattenedSchema()[key]?.default;
}
/**
 * Get the effective default value for a setting, checking experiment values when available.
 * For settings like compressionThreshold, this will return the experiment value if set,
 * otherwise falls back to the schema default.
 */
export function getEffectiveDefaultValue(key, config) {
    if (key === 'model.compressionThreshold' && config) {
        const experiments = config.getExperiments();
        const experimentValue = experiments?.flags[ExperimentFlags.CONTEXT_COMPRESSION_THRESHOLD]
            ?.floatValue;
        if (experimentValue !== undefined && experimentValue !== 0) {
            return experimentValue;
        }
    }
    return getDefaultValue(key);
}
/**
 * Get all setting keys that require restart
 */
export function getRestartRequiredSettings() {
    return Object.values(getFlattenedSchema())
        .filter((definition) => definition.requiresRestart)
        .map((definition) => definition.key);
}
/**
 * Recursively gets a value from a nested object using a key path array.
 */
export function getNestedValue(obj, path) {
    const [first, ...rest] = path;
    if (!first || !(first in obj)) {
        return undefined;
    }
    const value = obj[first];
    if (rest.length === 0) {
        return value;
    }
    if (value && typeof value === 'object' && value !== null) {
        return getNestedValue(value, rest);
    }
    return undefined;
}
/**
 * Get the effective value for a setting, considering inheritance from higher scopes
 * Always returns a value (never undefined) - falls back to default if not set anywhere
 */
export function getEffectiveValue(key, settings, mergedSettings) {
    const definition = getSettingDefinition(key);
    if (!definition) {
        return undefined;
    }
    const path = key.split('.');
    // Check the current scope's settings first
    let value = getNestedValue(settings, path);
    if (value !== undefined) {
        return value;
    }
    // Check the merged settings for an inherited value
    value = getNestedValue(mergedSettings, path);
    if (value !== undefined) {
        return value;
    }
    // Return default value if no value is set anywhere
    return definition.default;
}
/**
 * Get all setting keys from the schema
 */
export function getAllSettingKeys() {
    return Object.keys(getFlattenedSchema());
}
/**
 * Get settings by type
 */
export function getSettingsByType(type) {
    return Object.values(getFlattenedSchema()).filter((definition) => definition.type === type);
}
/**
 * Get settings that require restart
 */
export function getSettingsRequiringRestart() {
    return Object.values(getFlattenedSchema()).filter((definition) => definition.requiresRestart);
}
/**
 * Validate if a setting key exists in the schema
 */
export function isValidSettingKey(key) {
    return key in getFlattenedSchema();
}
/**
 * Get the category for a setting
 */
export function getSettingCategory(key) {
    return getFlattenedSchema()[key]?.category;
}
/**
 * Check if a setting should be shown in the settings dialog
 */
export function shouldShowInDialog(key) {
    return getFlattenedSchema()[key]?.showInDialog ?? true; // Default to true for backward compatibility
}
/**
 * Get all settings that should be shown in the dialog, grouped by category
 */
export function getDialogSettingsByCategory() {
    const categories = {};
    Object.values(getFlattenedSchema())
        .filter((definition) => definition.showInDialog !== false)
        .forEach((definition) => {
        const category = definition.category;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(definition);
    });
    return categories;
}
/**
 * Get settings by type that should be shown in the dialog
 */
export function getDialogSettingsByType(type) {
    return Object.values(getFlattenedSchema()).filter((definition) => definition.type === type && definition.showInDialog !== false);
}
/**
 * Get all setting keys that should be shown in the dialog
 */
export function getDialogSettingKeys() {
    return Object.values(getFlattenedSchema())
        .filter((definition) => definition.showInDialog !== false)
        .map((definition) => definition.key);
}
// ============================================================================
// BUSINESS LOGIC UTILITIES (Higher-level utilities for setting operations)
// ============================================================================
/**
 * Get the current value for a setting in a specific scope
 * Always returns a value (never undefined) - falls back to default if not set anywhere
 */
export function getSettingValue(key, settings, mergedSettings) {
    const definition = getSettingDefinition(key);
    if (!definition) {
        return false; // Default fallback for invalid settings
    }
    const value = getEffectiveValue(key, settings, mergedSettings);
    // Ensure we return a boolean value, converting from the more general type
    if (typeof value === 'boolean') {
        return value;
    }
    return false; // Final fallback
}
/**
 * Check if a setting value is modified from its default
 */
export function isSettingModified(key, value) {
    const defaultValue = getDefaultValue(key);
    // Handle type comparison properly
    if (typeof defaultValue === 'boolean') {
        return value !== defaultValue;
    }
    // If default is not a boolean, consider it modified if value is true
    return value === true;
}
/**
 * Check if a setting exists in the original settings file for a scope
 */
export function settingExistsInScope(key, scopeSettings) {
    const path = key.split('.');
    const value = getNestedValue(scopeSettings, path);
    return value !== undefined;
}
/**
 * Recursively sets a value in a nested object using a key path array.
 */
function setNestedValue(obj, path, value) {
    const [first, ...rest] = path;
    if (!first) {
        return obj;
    }
    if (rest.length === 0) {
        obj[first] = value;
        return obj;
    }
    if (!obj[first] || typeof obj[first] !== 'object') {
        obj[first] = {};
    }
    setNestedValue(obj[first], rest, value);
    return obj;
}
/**
 * Set a setting value in the pending settings
 */
export function setPendingSettingValue(key, value, pendingSettings) {
    const path = key.split('.');
    const newSettings = JSON.parse(JSON.stringify(pendingSettings));
    setNestedValue(newSettings, path, value);
    return newSettings;
}
/**
 * Generic setter: Set a setting value (boolean, number, string, etc.) in the pending settings
 */
export function setPendingSettingValueAny(key, value, pendingSettings) {
    const path = key.split('.');
    const newSettings = structuredClone(pendingSettings);
    setNestedValue(newSettings, path, value);
    return newSettings;
}
/**
 * Check if any modified settings require a restart
 */
export function hasRestartRequiredSettings(modifiedSettings) {
    return Array.from(modifiedSettings).some((key) => requiresRestart(key));
}
/**
 * Get the restart required settings from a set of modified settings
 */
export function getRestartRequiredFromModified(modifiedSettings) {
    return Array.from(modifiedSettings).filter((key) => requiresRestart(key));
}
/**
 * Save modified settings to the appropriate scope
 */
export function saveModifiedSettings(modifiedSettings, pendingSettings, loadedSettings, scope) {
    modifiedSettings.forEach((settingKey) => {
        const path = settingKey.split('.');
        const value = getNestedValue(pendingSettings, path);
        if (value === undefined) {
            return;
        }
        const existsInOriginalFile = settingExistsInScope(settingKey, loadedSettings.forScope(scope).settings);
        const isDefaultValue = value === getDefaultValue(settingKey);
        if (existsInOriginalFile || !isDefaultValue) {
            loadedSettings.setValue(scope, settingKey, value);
        }
    });
}
/**
 * Get the display value for a setting, showing current scope value with default change indicator
 */
export function getDisplayValue(key, settings, _mergedSettings, modifiedSettings, pendingSettings) {
    // Prioritize pending changes if user has modified this setting
    const definition = getSettingDefinition(key);
    let value;
    if (pendingSettings && settingExistsInScope(key, pendingSettings)) {
        // Show the value from the pending (unsaved) edits when it exists
        value = getEffectiveValue(key, pendingSettings, {});
    }
    else if (settingExistsInScope(key, settings)) {
        // Show the value defined at the current scope if present
        value = getEffectiveValue(key, settings, {});
    }
    else {
        // Fall back to the schema default when the key is unset in this scope
        value = getDefaultValue(key);
    }
    let valueString = String(value);
    if (definition?.type === 'enum' && definition.options) {
        const option = definition.options?.find((option) => option.value === value);
        valueString = option?.label ?? `${value}`;
    }
    // Check if value is different from default OR if it's in modified settings OR if there are pending changes
    const defaultValue = getDefaultValue(key);
    const isChangedFromDefault = value !== defaultValue;
    const isInModifiedSettings = modifiedSettings.has(key);
    // Mark as modified if setting exists in current scope OR is in modified settings
    if (settingExistsInScope(key, settings) || isInModifiedSettings) {
        return `${valueString}*`; // * indicates setting is set in current scope
    }
    if (isChangedFromDefault || isInModifiedSettings) {
        return `${valueString}*`; // * indicates changed from default value
    }
    return valueString;
}
/**
 * Check if a setting doesn't exist in current scope (should be greyed out)
 */
export function isDefaultValue(key, settings) {
    return !settingExistsInScope(key, settings);
}
/**
 * Check if a setting value is inherited (not set at current scope)
 */
export function isValueInherited(key, settings, _mergedSettings) {
    return !settingExistsInScope(key, settings);
}
/**
 * Get the effective value for display, considering inheritance
 * Always returns a boolean value (never undefined)
 */
export function getEffectiveDisplayValue(key, settings, mergedSettings) {
    return getSettingValue(key, settings, mergedSettings);
}
export const TEST_ONLY = { clearFlattenedSchema };
//# sourceMappingURL=settingsUtils.js.map