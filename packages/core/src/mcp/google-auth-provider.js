/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleAuth } from 'google-auth-library';
import { FIVE_MIN_BUFFER_MS } from './oauth-utils.js';
import { coreEvents } from '../utils/events.js';
const ALLOWED_HOSTS = [/^.+\.googleapis\.com$/, /^(.*\.)?luci\.app$/];
export class GoogleCredentialProvider {
    config;
    auth;
    cachedToken;
    tokenExpiryTime;
    // Properties required by OAuthClientProvider, with no-op values
    redirectUrl = '';
    clientMetadata = {
        client_name: 'Gemini CLI (Google ADC)',
        redirect_uris: [],
        grant_types: [],
        response_types: [],
        token_endpoint_auth_method: 'none',
    };
    _clientInformation;
    constructor(config) {
        this.config = config;
        const url = this.config?.url || this.config?.httpUrl;
        if (!url) {
            throw new Error('URL must be provided in the config for Google Credentials provider');
        }
        const hostname = new URL(url).hostname;
        if (!ALLOWED_HOSTS.some((pattern) => pattern.test(hostname))) {
            throw new Error(`Host "${hostname}" is not an allowed host for Google Credential provider.`);
        }
        const scopes = this.config?.oauth?.scopes;
        if (!scopes || scopes.length === 0) {
            throw new Error('Scopes must be provided in the oauth config for Google Credentials provider');
        }
        this.auth = new GoogleAuth({
            scopes,
        });
    }
    clientInformation() {
        return this._clientInformation;
    }
    saveClientInformation(clientInformation) {
        this._clientInformation = clientInformation;
    }
    async tokens() {
        // check for a valid, non-expired cached token.
        if (this.cachedToken &&
            this.tokenExpiryTime &&
            Date.now() < this.tokenExpiryTime - FIVE_MIN_BUFFER_MS) {
            return this.cachedToken;
        }
        // Clear invalid/expired cache.
        this.cachedToken = undefined;
        this.tokenExpiryTime = undefined;
        const client = await this.auth.getClient();
        const accessTokenResponse = await client.getAccessToken();
        if (!accessTokenResponse.token) {
            coreEvents.emitFeedback('error', 'Failed to get access token from Google ADC');
            return undefined;
        }
        const newToken = {
            access_token: accessTokenResponse.token,
            token_type: 'Bearer',
        };
        const expiryTime = client.credentials?.expiry_date;
        if (expiryTime) {
            this.tokenExpiryTime = expiryTime;
            this.cachedToken = newToken;
        }
        return newToken;
    }
    saveTokens(_tokens) {
        // No-op, ADC manages tokens.
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
    /**
     * Returns the project ID used for quota.
     */
    async getQuotaProjectId() {
        const client = await this.auth.getClient();
        return client.quotaProjectId;
    }
    /**
     * Returns custom headers to be added to the request.
     */
    async getRequestHeaders() {
        const headers = {};
        const configHeaders = this.config?.headers ?? {};
        const userProjectHeaderKey = Object.keys(configHeaders).find((key) => key.toLowerCase() === 'x-goog-user-project');
        // If the header is present in the config (case-insensitive check), use the
        // config's key and value. This prevents duplicate headers (e.g.
        // 'x-goog-user-project' and 'X-Goog-User-Project') which can cause errors.
        if (userProjectHeaderKey) {
            headers[userProjectHeaderKey] = configHeaders[userProjectHeaderKey];
        }
        else {
            const quotaProjectId = await this.getQuotaProjectId();
            if (quotaProjectId) {
                headers['X-Goog-User-Project'] = quotaProjectId;
            }
        }
        return headers;
    }
}
//# sourceMappingURL=google-auth-provider.js.map