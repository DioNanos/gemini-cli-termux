/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { HybridTokenStorage } from '../mcp/token-storage/hybrid-token-storage.js';
import { debugLogger } from '../utils/debugLogger.js';
const KEYCHAIN_SERVICE_NAME = 'gemini-cli-api-key';
const DEFAULT_API_KEY_ENTRY = 'default-api-key';
const storage = new HybridTokenStorage(KEYCHAIN_SERVICE_NAME);
/**
 * Load cached API key
 */
export async function loadApiKey() {
    try {
        const credentials = await storage.getCredentials(DEFAULT_API_KEY_ENTRY);
        if (credentials?.token?.accessToken) {
            return credentials.token.accessToken;
        }
        return null;
    }
    catch (error) {
        // Log other errors but don't crash, just return null so user can re-enter key
        debugLogger.error('Failed to load API key from storage:', error);
        return null;
    }
}
/**
 * Save API key
 */
export async function saveApiKey(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
        try {
            await storage.deleteCredentials(DEFAULT_API_KEY_ENTRY);
        }
        catch (error) {
            // Ignore errors when deleting, as it might not exist
            debugLogger.warn('Failed to delete API key from storage:', error);
        }
        return;
    }
    // Wrap API key in OAuthCredentials format as required by HybridTokenStorage
    const credentials = {
        serverName: DEFAULT_API_KEY_ENTRY,
        token: {
            accessToken: apiKey,
            tokenType: 'ApiKey',
        },
        updatedAt: Date.now(),
    };
    await storage.setCredentials(credentials);
}
/**
 * Clear cached API key
 */
export async function clearApiKey() {
    try {
        await storage.deleteCredentials(DEFAULT_API_KEY_ENTRY);
    }
    catch (error) {
        debugLogger.error('Failed to clear API key from storage:', error);
    }
}
//# sourceMappingURL=apiKeyCredentialStorage.js.map