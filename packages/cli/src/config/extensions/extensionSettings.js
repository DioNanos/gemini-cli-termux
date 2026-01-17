/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { ExtensionStorage } from './storage.js';
import prompts from 'prompts';
import { debugLogger, KeychainTokenStorage } from '@google/gemini-cli-core';
import { EXTENSION_SETTINGS_FILENAME } from './variables.js';
export var ExtensionSettingScope;
(function (ExtensionSettingScope) {
    ExtensionSettingScope["USER"] = "user";
    ExtensionSettingScope["WORKSPACE"] = "workspace";
})(ExtensionSettingScope || (ExtensionSettingScope = {}));
const getKeychainStorageName = (extensionName, extensionId, scope, workspaceDir) => {
    const base = `Gemini CLI Extensions ${extensionName} ${extensionId}`;
    if (scope === ExtensionSettingScope.WORKSPACE) {
        if (!workspaceDir) {
            throw new Error('Workspace directory is required for workspace scope');
        }
        return `${base} ${workspaceDir}`;
    }
    return base;
};
export const getEnvFilePath = (extensionName, scope, workspaceDir) => {
    if (scope === ExtensionSettingScope.WORKSPACE) {
        if (!workspaceDir) {
            throw new Error('Workspace directory is required for workspace scope');
        }
        return path.join(workspaceDir, EXTENSION_SETTINGS_FILENAME);
    }
    return new ExtensionStorage(extensionName).getEnvFilePath();
};
export async function maybePromptForSettings(extensionConfig, extensionId, requestSetting, previousExtensionConfig, previousSettings) {
    const { name: extensionName, settings } = extensionConfig;
    if ((!settings || settings.length === 0) &&
        (!previousExtensionConfig?.settings ||
            previousExtensionConfig.settings.length === 0)) {
        return;
    }
    // We assume user scope here because we don't have a way to ask the user for scope during the initial setup.
    // The user can change the scope later using the `settings set` command.
    const scope = ExtensionSettingScope.USER;
    const envFilePath = getEnvFilePath(extensionName, scope);
    const keychain = new KeychainTokenStorage(getKeychainStorageName(extensionName, extensionId, scope));
    if (!settings || settings.length === 0) {
        await clearSettings(envFilePath, keychain);
        return;
    }
    const settingsChanges = getSettingsChanges(settings, previousExtensionConfig?.settings ?? []);
    const allSettings = { ...previousSettings };
    for (const removedEnvSetting of settingsChanges.removeEnv) {
        delete allSettings[removedEnvSetting.envVar];
    }
    for (const removedSensitiveSetting of settingsChanges.removeSensitive) {
        await keychain.deleteSecret(removedSensitiveSetting.envVar);
    }
    for (const setting of settingsChanges.promptForSensitive.concat(settingsChanges.promptForEnv)) {
        const answer = await requestSetting(setting);
        allSettings[setting.envVar] = answer;
    }
    const nonSensitiveSettings = {};
    for (const setting of settings) {
        const value = allSettings[setting.envVar];
        if (value === undefined) {
            continue;
        }
        if (setting.sensitive) {
            await keychain.setSecret(setting.envVar, value);
        }
        else {
            nonSensitiveSettings[setting.envVar] = value;
        }
    }
    const envContent = formatEnvContent(nonSensitiveSettings);
    await fs.writeFile(envFilePath, envContent);
}
function formatEnvContent(settings) {
    let envContent = '';
    for (const [key, value] of Object.entries(settings)) {
        const formattedValue = value.includes(' ') ? `"${value}"` : value;
        envContent += `${key}=${formattedValue}\n`;
    }
    return envContent;
}
export async function promptForSetting(setting) {
    const response = await prompts({
        type: setting.sensitive ? 'password' : 'text',
        name: 'value',
        message: `${setting.name}\n${setting.description}`,
    });
    return response.value;
}
export async function getScopedEnvContents(extensionConfig, extensionId, scope, workspaceDir) {
    const { name: extensionName } = extensionConfig;
    const keychain = new KeychainTokenStorage(getKeychainStorageName(extensionName, extensionId, scope, workspaceDir));
    const envFilePath = getEnvFilePath(extensionName, scope, workspaceDir);
    let customEnv = {};
    if (fsSync.existsSync(envFilePath)) {
        const envFile = fsSync.readFileSync(envFilePath, 'utf-8');
        customEnv = dotenv.parse(envFile);
    }
    if (extensionConfig.settings) {
        for (const setting of extensionConfig.settings) {
            if (setting.sensitive) {
                const secret = await keychain.getSecret(setting.envVar);
                if (secret) {
                    customEnv[setting.envVar] = secret;
                }
            }
        }
    }
    return customEnv;
}
export async function getEnvContents(extensionConfig, extensionId, workspaceDir) {
    if (!extensionConfig.settings || extensionConfig.settings.length === 0) {
        return Promise.resolve({});
    }
    const userSettings = await getScopedEnvContents(extensionConfig, extensionId, ExtensionSettingScope.USER);
    const workspaceSettings = await getScopedEnvContents(extensionConfig, extensionId, ExtensionSettingScope.WORKSPACE, workspaceDir);
    return { ...userSettings, ...workspaceSettings };
}
export async function updateSetting(extensionConfig, extensionId, settingKey, requestSetting, scope, workspaceDir) {
    const { name: extensionName, settings } = extensionConfig;
    if (!settings || settings.length === 0) {
        debugLogger.log('This extension does not have any settings.');
        return;
    }
    const settingToUpdate = settings.find((s) => s.name === settingKey || s.envVar === settingKey);
    if (!settingToUpdate) {
        debugLogger.log(`Setting ${settingKey} not found.`);
        return;
    }
    const newValue = await requestSetting(settingToUpdate);
    const keychain = new KeychainTokenStorage(getKeychainStorageName(extensionName, extensionId, scope, workspaceDir));
    if (settingToUpdate.sensitive) {
        await keychain.setSecret(settingToUpdate.envVar, newValue);
        return;
    }
    // For non-sensitive settings, we need to read the existing .env file,
    // update the value, and write it back, preserving any other values.
    const envFilePath = getEnvFilePath(extensionName, scope, workspaceDir);
    let envContent = '';
    if (fsSync.existsSync(envFilePath)) {
        envContent = await fs.readFile(envFilePath, 'utf-8');
    }
    const parsedEnv = dotenv.parse(envContent);
    parsedEnv[settingToUpdate.envVar] = newValue;
    // We only want to write back the variables that are not sensitive.
    const nonSensitiveSettings = {};
    const sensitiveEnvVars = new Set(settings.filter((s) => s.sensitive).map((s) => s.envVar));
    for (const [key, value] of Object.entries(parsedEnv)) {
        if (!sensitiveEnvVars.has(key)) {
            nonSensitiveSettings[key] = value;
        }
    }
    const newEnvContent = formatEnvContent(nonSensitiveSettings);
    await fs.writeFile(envFilePath, newEnvContent);
}
function getSettingsChanges(settings, oldSettings) {
    const isSameSetting = (a, b) => a.envVar === b.envVar && (a.sensitive ?? false) === (b.sensitive ?? false);
    const sensitiveOld = oldSettings.filter((s) => s.sensitive ?? false);
    const sensitiveNew = settings.filter((s) => s.sensitive ?? false);
    const envOld = oldSettings.filter((s) => !(s.sensitive ?? false));
    const envNew = settings.filter((s) => !(s.sensitive ?? false));
    return {
        promptForSensitive: sensitiveNew.filter((s) => !sensitiveOld.some((old) => isSameSetting(s, old))),
        removeSensitive: sensitiveOld.filter((s) => !sensitiveNew.some((neu) => isSameSetting(s, neu))),
        promptForEnv: envNew.filter((s) => !envOld.some((old) => isSameSetting(s, old))),
        removeEnv: envOld.filter((s) => !envNew.some((neu) => isSameSetting(s, neu))),
    };
}
async function clearSettings(envFilePath, keychain) {
    if (fsSync.existsSync(envFilePath)) {
        await fs.writeFile(envFilePath, '');
    }
    if (!(await keychain.isAvailable())) {
        return;
    }
    const secrets = await keychain.listSecrets();
    for (const secret of secrets) {
        await keychain.deleteSecret(secret);
    }
    return;
}
export async function getMissingSettings(extensionConfig, extensionId, workspaceDir) {
    const { settings } = extensionConfig;
    if (!settings || settings.length === 0) {
        return [];
    }
    const existingSettings = await getEnvContents(extensionConfig, extensionId, workspaceDir);
    const missingSettings = [];
    for (const setting of settings) {
        if (existingSettings[setting.envVar] === undefined) {
            missingSettings.push(setting);
        }
    }
    return missingSettings;
}
//# sourceMappingURL=extensionSettings.js.map