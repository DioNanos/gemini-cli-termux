/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { debugLogger, GEMINI_DIR, getErrorMessage, homedir, } from '@google/gemini-cli-core';
import stripJsonComments from 'strip-json-comments';
export const USER_SETTINGS_DIR = path.join(homedir(), GEMINI_DIR);
export const USER_SETTINGS_PATH = path.join(USER_SETTINGS_DIR, 'settings.json');
/**
 * Loads settings from user and workspace directories.
 * Project settings override user settings.
 *
 * How is it different to gemini-cli/cli: Returns already merged settings rather
 * than `LoadedSettings` (unnecessary since we are not modifying users
 * settings.json).
 */
export function loadSettings(workspaceDir) {
    let userSettings = {};
    let workspaceSettings = {};
    const settingsErrors = [];
    // Load user settings
    try {
        if (fs.existsSync(USER_SETTINGS_PATH)) {
            const userContent = fs.readFileSync(USER_SETTINGS_PATH, 'utf-8');
            const parsedUserSettings = JSON.parse(stripJsonComments(userContent));
            userSettings = resolveEnvVarsInObject(parsedUserSettings);
        }
    }
    catch (error) {
        settingsErrors.push({
            message: getErrorMessage(error),
            path: USER_SETTINGS_PATH,
        });
    }
    const workspaceSettingsPath = path.join(workspaceDir, GEMINI_DIR, 'settings.json');
    // Load workspace settings
    try {
        if (fs.existsSync(workspaceSettingsPath)) {
            const projectContent = fs.readFileSync(workspaceSettingsPath, 'utf-8');
            const parsedWorkspaceSettings = JSON.parse(stripJsonComments(projectContent));
            workspaceSettings = resolveEnvVarsInObject(parsedWorkspaceSettings);
        }
    }
    catch (error) {
        settingsErrors.push({
            message: getErrorMessage(error),
            path: workspaceSettingsPath,
        });
    }
    if (settingsErrors.length > 0) {
        debugLogger.error('Errors loading settings:');
        for (const error of settingsErrors) {
            debugLogger.error(`  Path: ${error.path}`);
            debugLogger.error(`  Message: ${error.message}`);
        }
    }
    // If there are overlapping keys, the values of workspaceSettings will
    // override values from userSettings
    return {
        ...userSettings,
        ...workspaceSettings,
    };
}
function resolveEnvVarsInString(value) {
    const envVarRegex = /\$(?:(\w+)|{([^}]+)})/g; // Find $VAR_NAME or ${VAR_NAME}
    return value.replace(envVarRegex, (match, varName1, varName2) => {
        const varName = varName1 || varName2;
        if (process && process.env && typeof process.env[varName] === 'string') {
            return process.env[varName];
        }
        return match;
    });
}
function resolveEnvVarsInObject(obj) {
    if (obj === null ||
        obj === undefined ||
        typeof obj === 'boolean' ||
        typeof obj === 'number') {
        return obj;
    }
    if (typeof obj === 'string') {
        return resolveEnvVarsInString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => resolveEnvVarsInObject(item));
    }
    if (typeof obj === 'object') {
        const newObj = { ...obj };
        for (const key in newObj) {
            if (Object.prototype.hasOwnProperty.call(newObj, key)) {
                newObj[key] = resolveEnvVarsInObject(newObj[key]);
            }
        }
        return newObj;
    }
    return obj;
}
//# sourceMappingURL=settings.js.map