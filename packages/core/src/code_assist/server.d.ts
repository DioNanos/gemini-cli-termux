/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AuthClient } from 'google-auth-library';
import type { CodeAssistGlobalUserSettingResponse, LoadCodeAssistRequest, LoadCodeAssistResponse, LongRunningOperationResponse, OnboardUserRequest, SetCodeAssistGlobalUserSettingRequest, ClientMetadata, RetrieveUserQuotaRequest, RetrieveUserQuotaResponse, FetchAdminControlsRequest, FetchAdminControlsResponse, ConversationOffered, ConversationInteraction, RecordCodeAssistMetricsRequest } from './types.js';
import type { ListExperimentsResponse } from './experiments/types.js';
import type { CountTokensParameters, CountTokensResponse, EmbedContentParameters, EmbedContentResponse, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import type { ContentGenerator } from '../core/contentGenerator.js';
import { UserTierId } from './types.js';
/** HTTP options to be used in each of the requests. */
export interface HttpOptions {
    /** Additional HTTP headers to be sent with the request. */
    headers?: Record<string, string>;
}
export declare const CODE_ASSIST_ENDPOINT = "https://cloudcode-pa.googleapis.com";
export declare const CODE_ASSIST_API_VERSION = "v1internal";
export declare class CodeAssistServer implements ContentGenerator {
    readonly client: AuthClient;
    readonly projectId?: string | undefined;
    readonly httpOptions: HttpOptions;
    readonly sessionId?: string | undefined;
    readonly userTier?: UserTierId | undefined;
    constructor(client: AuthClient, projectId?: string | undefined, httpOptions?: HttpOptions, sessionId?: string | undefined, userTier?: UserTierId | undefined);
    generateContentStream(req: GenerateContentParameters, userPromptId: string): Promise<AsyncGenerator<GenerateContentResponse>>;
    generateContent(req: GenerateContentParameters, userPromptId: string): Promise<GenerateContentResponse>;
    onboardUser(req: OnboardUserRequest): Promise<LongRunningOperationResponse>;
    getOperation(name: string): Promise<LongRunningOperationResponse>;
    loadCodeAssist(req: LoadCodeAssistRequest): Promise<LoadCodeAssistResponse>;
    fetchAdminControls(req: FetchAdminControlsRequest): Promise<FetchAdminControlsResponse>;
    getCodeAssistGlobalUserSetting(): Promise<CodeAssistGlobalUserSettingResponse>;
    setCodeAssistGlobalUserSetting(req: SetCodeAssistGlobalUserSettingRequest): Promise<CodeAssistGlobalUserSettingResponse>;
    countTokens(req: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(_req: EmbedContentParameters): Promise<EmbedContentResponse>;
    listExperiments(metadata: ClientMetadata): Promise<ListExperimentsResponse>;
    retrieveUserQuota(req: RetrieveUserQuotaRequest): Promise<RetrieveUserQuotaResponse>;
    recordConversationOffered(conversationOffered: ConversationOffered): Promise<void>;
    recordConversationInteraction(interaction: ConversationInteraction): Promise<void>;
    recordCodeAssistMetrics(request: RecordCodeAssistMetricsRequest): Promise<void>;
    requestPost<T>(method: string, req: object, signal?: AbortSignal): Promise<T>;
    private makeGetRequest;
    requestGet<T>(method: string, signal?: AbortSignal): Promise<T>;
    requestGetOperation<T>(name: string, signal?: AbortSignal): Promise<T>;
    requestStreamingPost<T>(method: string, req: object, signal?: AbortSignal): Promise<AsyncGenerator<T>>;
    private getBaseUrl;
    getMethodUrl(method: string): string;
    getOperationUrl(name: string): string;
}
