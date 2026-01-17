/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AuthClient } from 'google-auth-library';
import { EventEmitter } from 'node:events';
import type { Config } from '../config/config.js';
import { AuthType } from '../core/contentGenerator.js';
export declare const authEvents: EventEmitter<[never]>;
/**
 * An Authentication URL for updating the credentials of a Oauth2Client
 * as well as a promise that will resolve when the credentials have
 * been refreshed (or which throws error when refreshing credentials failed).
 */
export interface OauthWebLogin {
    authUrl: string;
    loginCompletePromise: Promise<void>;
}
export declare function getOauthClient(authType: AuthType, config: Config): Promise<AuthClient>;
export declare function getAvailablePort(): Promise<number>;
export declare function clearOauthClientCache(): void;
export declare function clearCachedCredentialFile(): Promise<void>;
export declare function resetOauthClientForTesting(): void;
