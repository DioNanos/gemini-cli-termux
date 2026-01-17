/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import semver from 'semver';
import type { LoadedSettings } from '../../config/settings.js';
export declare const FETCH_TIMEOUT_MS = 2000;
export interface UpdateInfo {
    latest: string;
    current: string;
    name: string;
    type?: semver.ReleaseType;
}
export interface UpdateObject {
    message: string;
    update: UpdateInfo;
}
export declare function checkForUpdates(settings: LoadedSettings): Promise<UpdateObject | null>;
