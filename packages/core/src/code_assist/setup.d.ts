/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { UserTierId } from './types.js';
import type { AuthClient } from 'google-auth-library';
export declare class ProjectIdRequiredError extends Error {
    constructor();
}
export interface UserData {
    projectId: string;
    userTier: UserTierId;
}
/**
 *
 * @param projectId the user's project id, if any
 * @returns the user's actual project id
 */
export declare function setupUser(client: AuthClient): Promise<UserData>;
