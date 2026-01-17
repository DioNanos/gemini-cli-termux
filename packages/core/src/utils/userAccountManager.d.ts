/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare class UserAccountManager {
    private getGoogleAccountsCachePath;
    /**
     * Parses and validates the string content of an accounts file.
     * @param content The raw string content from the file.
     * @returns A valid UserAccounts object.
     */
    private parseAndValidateAccounts;
    private readAccountsSync;
    private readAccounts;
    cacheGoogleAccount(email: string): Promise<void>;
    getCachedGoogleAccount(): string | null;
    getLifetimeGoogleAccounts(): number;
    clearCachedGoogleAccount(): Promise<void>;
}
