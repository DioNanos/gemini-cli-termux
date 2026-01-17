/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performInitialAuth } from './auth.js';
import {} from '@google/gemini-cli-core';
vi.mock('@google/gemini-cli-core', () => ({
    AuthType: {
        OAUTH: 'oauth',
    },
    getErrorMessage: (e) => e.message,
}));
const AuthType = {
    OAUTH: 'oauth',
};
describe('auth', () => {
    let mockConfig;
    beforeEach(() => {
        mockConfig = {
            refreshAuth: vi.fn(),
        };
    });
    it('should return null if authType is undefined', async () => {
        const result = await performInitialAuth(mockConfig, undefined);
        expect(result).toBeNull();
        expect(mockConfig.refreshAuth).not.toHaveBeenCalled();
    });
    it('should return null on successful auth', async () => {
        const result = await performInitialAuth(mockConfig, AuthType.OAUTH);
        expect(result).toBeNull();
        expect(mockConfig.refreshAuth).toHaveBeenCalledWith(AuthType.OAUTH);
    });
    it('should return error message on failed auth', async () => {
        const error = new Error('Auth failed');
        vi.mocked(mockConfig.refreshAuth).mockRejectedValue(error);
        const result = await performInitialAuth(mockConfig, AuthType.OAUTH);
        expect(result).toBe('Failed to login. Message: Auth failed');
        expect(mockConfig.refreshAuth).toHaveBeenCalledWith(AuthType.OAUTH);
    });
});
//# sourceMappingURL=auth.test.js.map