/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CodeAssistServer } from '../server.js';
import { type FetchAdminControlsResponse } from '../types.js';
export declare function sanitizeAdminSettings(settings: FetchAdminControlsResponse): FetchAdminControlsResponse;
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
export declare function fetchAdminControls(server: CodeAssistServer | undefined, cachedSettings: FetchAdminControlsResponse | undefined, adminControlsEnabled: boolean, onSettingsChanged: (settings: FetchAdminControlsResponse) => void): Promise<FetchAdminControlsResponse>;
/**
 * Stops polling for admin controls.
 */
export declare function stopAdminControlsPolling(): void;
