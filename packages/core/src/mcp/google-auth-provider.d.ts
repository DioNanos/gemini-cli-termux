/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { McpAuthProvider } from './auth-provider.js';
import type { OAuthClientInformation, OAuthClientInformationFull, OAuthClientMetadata, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import type { MCPServerConfig } from '../config/config.js';
export declare class GoogleCredentialProvider implements McpAuthProvider {
    private readonly config?;
    private readonly auth;
    private cachedToken?;
    private tokenExpiryTime?;
    readonly redirectUrl = "";
    readonly clientMetadata: OAuthClientMetadata;
    private _clientInformation?;
    constructor(config?: MCPServerConfig | undefined);
    clientInformation(): OAuthClientInformation | undefined;
    saveClientInformation(clientInformation: OAuthClientInformationFull): void;
    tokens(): Promise<OAuthTokens | undefined>;
    saveTokens(_tokens: OAuthTokens): void;
    redirectToAuthorization(_authorizationUrl: URL): void;
    saveCodeVerifier(_codeVerifier: string): void;
    codeVerifier(): string;
    /**
     * Returns the project ID used for quota.
     */
    getQuotaProjectId(): Promise<string | undefined>;
    /**
     * Returns custom headers to be added to the request.
     */
    getRequestHeaders(): Promise<Record<string, string>>;
}
