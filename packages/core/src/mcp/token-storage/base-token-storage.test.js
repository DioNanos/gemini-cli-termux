/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { BaseTokenStorage } from './base-token-storage.js';
class TestTokenStorage extends BaseTokenStorage {
    storage = new Map();
    async getCredentials(serverName) {
        return this.storage.get(serverName) || null;
    }
    async setCredentials(credentials) {
        this.validateCredentials(credentials);
        this.storage.set(credentials.serverName, credentials);
    }
    async deleteCredentials(serverName) {
        this.storage.delete(serverName);
    }
    async listServers() {
        return Array.from(this.storage.keys());
    }
    async getAllCredentials() {
        return new Map(this.storage);
    }
    async clearAll() {
        this.storage.clear();
    }
    validateCredentials(credentials) {
        super.validateCredentials(credentials);
    }
    isTokenExpired(credentials) {
        return super.isTokenExpired(credentials);
    }
    sanitizeServerName(serverName) {
        return super.sanitizeServerName(serverName);
    }
}
describe('BaseTokenStorage', () => {
    let storage;
    beforeEach(() => {
        storage = new TestTokenStorage('gemini-cli-mcp-oauth');
    });
    describe('validateCredentials', () => {
        it('should validate valid credentials', () => {
            const credentials = {
                serverName: 'test-server',
                token: {
                    accessToken: 'access-token',
                    tokenType: 'Bearer',
                },
                updatedAt: Date.now(),
            };
            expect(() => storage.validateCredentials(credentials)).not.toThrow();
        });
        it.each([
            {
                desc: 'missing server name',
                credentials: {
                    serverName: '',
                    token: {
                        accessToken: 'access-token',
                        tokenType: 'Bearer',
                    },
                    updatedAt: Date.now(),
                },
                expectedError: 'Server name is required',
            },
            {
                desc: 'missing token',
                credentials: {
                    serverName: 'test-server',
                    token: null,
                    updatedAt: Date.now(),
                },
                expectedError: 'Token is required',
            },
            {
                desc: 'missing access token',
                credentials: {
                    serverName: 'test-server',
                    token: {
                        accessToken: '',
                        tokenType: 'Bearer',
                    },
                    updatedAt: Date.now(),
                },
                expectedError: 'Access token is required',
            },
            {
                desc: 'missing token type',
                credentials: {
                    serverName: 'test-server',
                    token: {
                        accessToken: 'access-token',
                        tokenType: '',
                    },
                    updatedAt: Date.now(),
                },
                expectedError: 'Token type is required',
            },
        ])('should throw for $desc', ({ credentials, expectedError }) => {
            expect(() => storage.validateCredentials(credentials)).toThrow(expectedError);
        });
    });
    describe('isTokenExpired', () => {
        it.each([
            ['tokens without expiry', undefined, false],
            ['valid tokens', Date.now() + 3600000, false],
            ['expired tokens', Date.now() - 3600000, true],
            [
                'tokens within 5-minute buffer (4 minutes from now)',
                Date.now() + 4 * 60 * 1000,
                true,
            ],
        ])('should return %s for %s', (_, expiresAt, expected) => {
            const credentials = {
                serverName: 'test-server',
                token: {
                    accessToken: 'access-token',
                    tokenType: 'Bearer',
                    ...(expiresAt !== undefined && { expiresAt }),
                },
                updatedAt: Date.now(),
            };
            expect(storage.isTokenExpired(credentials)).toBe(expected);
        });
    });
    describe('sanitizeServerName', () => {
        it.each([
            [
                'valid characters',
                'test-server.example_123',
                'test-server.example_123',
            ],
            [
                'invalid characters with underscore replacement',
                'test@server#example',
                'test_server_example',
            ],
            [
                'special characters',
                'test server/example:123',
                'test_server_example_123',
            ],
        ])('should handle %s', (_, input, expected) => {
            expect(storage.sanitizeServerName(input)).toBe(expected);
        });
    });
});
//# sourceMappingURL=base-token-storage.test.js.map