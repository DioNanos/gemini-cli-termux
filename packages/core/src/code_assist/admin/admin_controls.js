/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { debugLogger } from '../../utils/debugLogger.js';
import { isDeepStrictEqual } from 'node:util';
import { FetchAdminControlsResponseSchema, } from '../types.js';
let pollingInterval;
let currentSettings;
export function sanitizeAdminSettings(settings) {
    const result = FetchAdminControlsResponseSchema.safeParse(settings);
    if (!result.success) {
        return {};
    }
    return result.data;
}
/**
 * Fetches the admin controls from the server if enabled by experiment flag.
 * Safely handles polling start/stop based on the flag and server availability.
 *
 * @param server The CodeAssistServer instance.
 * @param cachedSettings The cached settings to use if available.
 * @param adminControlsEnabled Whether admin controls are enabled.
 * @param onSettingsChanged Callback to invoke when settings change during polling.
 * @returns The fetched settings if enabled and successful, otherwise undefined.
 */
export async function fetchAdminControls(server, cachedSettings, adminControlsEnabled, onSettingsChanged) {
    if (!server || !server.projectId || !adminControlsEnabled) {
        stopAdminControlsPolling();
        currentSettings = undefined;
        return {};
    }
    // If we already have settings (e.g. from IPC during relaunch), use them
    // to avoid blocking startup with another fetch. We'll still start polling.
    if (cachedSettings) {
        currentSettings = cachedSettings;
        startAdminControlsPolling(server, server.projectId, onSettingsChanged);
        return cachedSettings;
    }
    try {
        const rawSettings = await server.fetchAdminControls({
            project: server.projectId,
        });
        const sanitizedSettings = sanitizeAdminSettings(rawSettings);
        currentSettings = sanitizedSettings;
        startAdminControlsPolling(server, server.projectId, onSettingsChanged);
        return sanitizedSettings;
    }
    catch (e) {
        debugLogger.error('Failed to fetch admin controls: ', e);
        // If initial fetch fails, start polling to retry.
        currentSettings = {};
        startAdminControlsPolling(server, server.projectId, onSettingsChanged);
        return {};
    }
}
/**
 * Starts polling for admin controls.
 */
function startAdminControlsPolling(server, project, onSettingsChanged) {
    stopAdminControlsPolling();
    pollingInterval = setInterval(async () => {
        try {
            const rawSettings = await server.fetchAdminControls({
                project,
            });
            const newSettings = sanitizeAdminSettings(rawSettings);
            if (!isDeepStrictEqual(newSettings, currentSettings)) {
                currentSettings = newSettings;
                onSettingsChanged(newSettings);
            }
        }
        catch (e) {
            debugLogger.error('Failed to poll admin controls: ', e);
        }
    }, 5 * 60 * 1000); // 5 minutes
}
/**
 * Stops polling for admin controls.
 */
export function stopAdminControlsPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = undefined;
    }
}
//# sourceMappingURL=admin_controls.js.map