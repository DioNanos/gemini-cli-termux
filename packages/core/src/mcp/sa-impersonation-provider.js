/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleAuth } from 'google-auth-library';
import { OAuthUtils, FIVE_MIN_BUFFER_MS } from './oauth-utils.js';
import { coreEvents } from '../utils/events.js';
function createIamApiUrl(targetSA) {
    return `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(targetSA)}:generateIdToken`;
}
export class ServiceAccountImpersonationProvider {
    config;
    targetServiceAccount;
    targetAudience; // OAuth Client Id
    auth;
    cachedToken;
    tokenExpiryTime;
    // Properties required by OAuthClientProvider, with no-op values
    redirectUrl = '';
    clientMetadata = {
        client_name: 'Gemini CLI (Service Account Impersonation)',
        redirect_uris: [],
        grant_types: [],
        response_types: [],
        token_endpoint_auth_method: 'none',
    };
    _clientInformation;
    constructor(config) {
        this.config = config;
        // This check is done in mcp-client.ts. This is just an additional check.
        if (!this.config.httpUrl && !this.config.url) {
            throw new Error('A url or httpUrl must be provided for the Service Account Impersonation provider');
        }
        if (!config.targetAudience) {
            throw new Error('targetAudience must be provided for the Service Account Impersonation provider');
        }
        this.targetAudience = config.targetAudience;
        if (!config.targetServiceAccount) {
            throw new Error('targetServiceAccount must be provided for the Service Account Impersonation provider');
        }
        this.targetServiceAccount = config.targetServiceAccount;
        this.auth = new GoogleAuth();
    }
    clientInformation() {
        return this._clientInformation;
    }
    saveClientInformation(clientInformation) {
        this._clientInformation = clientInformation;
    }
    async tokens() {
        // 1. Check if we have a valid, non-expired cached token.
        if (this.cachedToken &&
            this.tokenExpiryTime &&
            Date.now() < this.tokenExpiryTime - FIVE_MIN_BUFFER_MS) {
            return this.cachedToken;
        }
        // 2. Clear any invalid/expired cache.
        this.cachedToken = undefined;
        this.tokenExpiryTime = undefined;
        // 3. Fetch a new ID token.
        const client = await this.auth.getClient();
        const url = createIamApiUrl(this.targetServiceAccount);
        let idToken;
        try {
            const res = await client.request({
                url,
                method: 'POST',
                data: {
                    audience: this.targetAudience,
                    includeEmail: true,
                },
            });
            idToken = res.data.token;
            if (!idToken || idToken.length === 0) {
                coreEvents.emitFeedback('error', 'Failed to obtain authentication token.');
                return undefined;
            }
        }
        catch (e) {
            coreEvents.emitFeedback('error', 'Failed to obtain authentication token.', e);
            return undefined;
        }
        const expiryTime = OAuthUtils.parseTokenExpiry(idToken);
        // Note: We are placing the OIDC ID Token into the `access_token` field.
        // This is because the CLI uses this field to construct the
        // `Authorization: Bearer <token>` header, which is the correct way to
        // present an ID token.
        const newTokens = {
            access_token: idToken,
            token_type: 'Bearer',
        };
        if (expiryTime) {
            this.tokenExpiryTime = expiryTime;
            this.cachedToken = newTokens;
        }
        return newTokens;
    }
    saveTokens(_tokens) {
        // No-op
    }
    redirectToAuthorization(_authorizationUrl) {
        // No-op
    }
    saveCodeVerifier(_codeVerifier) {
        // No-op
    }
    codeVerifier() {
        // No-op
        return '';
    }
}
//# sourceMappingURL=sa-impersonation-provider.js.map