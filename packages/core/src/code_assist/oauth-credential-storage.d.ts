/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Credentials } from 'google-auth-library';
export declare class OAuthCredentialStorage {
    private static storage;
    /**
     * Load cached OAuth credentials
     */
    static loadCredentials(): Promise<Credentials | null>;
    /**
     * Save OAuth credentials
     */
    static saveCredentials(credentials: Credentials): Promise<void>;
    /**
     * Clear cached OAuth credentials
     */
    static clearCredentials(): Promise<void>;
    /**
     * Migrate credentials from old file-based storage to keychain
     */
    private static migrateFromFileStorage;
}
