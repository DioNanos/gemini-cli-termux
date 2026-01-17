/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as readline from 'node:readline';
import { UserTierId } from './types.js';
import { fromCountTokenResponse, fromGenerateContentResponse, toCountTokenRequest, toGenerateContentRequest, } from './converter.js';
import { formatProtoJsonDuration, recordConversationOffered, } from './telemetry.js';
import { getClientMetadata } from './experiments/client_metadata.js';
export const CODE_ASSIST_ENDPOINT = 'https://cloudcode-pa.googleapis.com';
export const CODE_ASSIST_API_VERSION = 'v1internal';
export class CodeAssistServer {
    client;
    projectId;
    httpOptions;
    sessionId;
    userTier;
    constructor(client, projectId, httpOptions = {}, sessionId, userTier) {
        this.client = client;
        this.projectId = projectId;
        this.httpOptions = httpOptions;
        this.sessionId = sessionId;
        this.userTier = userTier;
    }
    async generateContentStream(req, userPromptId) {
        const responses = await this.requestStreamingPost('streamGenerateContent', toGenerateContentRequest(req, userPromptId, this.projectId, this.sessionId), req.config?.abortSignal);
        const streamingLatency = {};
        const start = Date.now();
        let isFirst = true;
        return (async function* (server) {
            for await (const response of responses) {
                if (isFirst) {
                    streamingLatency.firstMessageLatency = formatProtoJsonDuration(Date.now() - start);
                    isFirst = false;
                }
                streamingLatency.totalLatency = formatProtoJsonDuration(Date.now() - start);
                const translatedResponse = fromGenerateContentResponse(response);
                await recordConversationOffered(server, response.traceId, translatedResponse, streamingLatency, req.config?.abortSignal);
                yield translatedResponse;
            }
        })(this);
    }
    async generateContent(req, userPromptId) {
        const start = Date.now();
        const response = await this.requestPost('generateContent', toGenerateContentRequest(req, userPromptId, this.projectId, this.sessionId), req.config?.abortSignal);
        const duration = formatProtoJsonDuration(Date.now() - start);
        const streamingLatency = {
            totalLatency: duration,
            firstMessageLatency: duration,
        };
        const translatedResponse = fromGenerateContentResponse(response);
        await recordConversationOffered(this, response.traceId, translatedResponse, streamingLatency, req.config?.abortSignal);
        return translatedResponse;
    }
    async onboardUser(req) {
        return this.requestPost('onboardUser', req);
    }
    async getOperation(name) {
        return this.requestGetOperation(name);
    }
    async loadCodeAssist(req) {
        try {
            return await this.requestPost('loadCodeAssist', req);
        }
        catch (e) {
            if (isVpcScAffectedUser(e)) {
                return {
                    currentTier: { id: UserTierId.STANDARD },
                };
            }
            else {
                throw e;
            }
        }
    }
    async fetchAdminControls(req) {
        return this.requestPost('fetchAdminControls', req);
    }
    async getCodeAssistGlobalUserSetting() {
        return this.requestGet('getCodeAssistGlobalUserSetting');
    }
    async setCodeAssistGlobalUserSetting(req) {
        return this.requestPost('setCodeAssistGlobalUserSetting', req);
    }
    async countTokens(req) {
        const resp = await this.requestPost('countTokens', toCountTokenRequest(req));
        return fromCountTokenResponse(resp);
    }
    async embedContent(_req) {
        throw Error();
    }
    async listExperiments(metadata) {
        if (!this.projectId) {
            throw new Error('projectId is not defined for CodeAssistServer.');
        }
        const projectId = this.projectId;
        const req = {
            project: projectId,
            metadata: { ...metadata, duetProject: projectId },
        };
        return this.requestPost('listExperiments', req);
    }
    async retrieveUserQuota(req) {
        return this.requestPost('retrieveUserQuota', req);
    }
    async recordConversationOffered(conversationOffered) {
        if (!this.projectId) {
            return;
        }
        await this.recordCodeAssistMetrics({
            project: this.projectId,
            metadata: await getClientMetadata(),
            metrics: [{ conversationOffered, timestamp: new Date().toISOString() }],
        });
    }
    async recordConversationInteraction(interaction) {
        if (!this.projectId) {
            return;
        }
        await this.recordCodeAssistMetrics({
            project: this.projectId,
            metadata: await getClientMetadata(),
            metrics: [
                {
                    conversationInteraction: interaction,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
    }
    async recordCodeAssistMetrics(request) {
        return this.requestPost('recordCodeAssistMetrics', request);
    }
    async requestPost(method, req, signal) {
        const res = await this.client.request({
            url: this.getMethodUrl(method),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.httpOptions.headers,
            },
            responseType: 'json',
            body: JSON.stringify(req),
            signal,
        });
        return res.data;
    }
    async makeGetRequest(url, signal) {
        const res = await this.client.request({
            url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.httpOptions.headers,
            },
            responseType: 'json',
            signal,
        });
        return res.data;
    }
    async requestGet(method, signal) {
        return this.makeGetRequest(this.getMethodUrl(method), signal);
    }
    async requestGetOperation(name, signal) {
        return this.makeGetRequest(this.getOperationUrl(name), signal);
    }
    async requestStreamingPost(method, req, signal) {
        const res = await this.client.request({
            url: this.getMethodUrl(method),
            method: 'POST',
            params: {
                alt: 'sse',
            },
            headers: {
                'Content-Type': 'application/json',
                ...this.httpOptions.headers,
            },
            responseType: 'stream',
            body: JSON.stringify(req),
            signal,
        });
        return (async function* () {
            const rl = readline.createInterface({
                input: res.data,
                crlfDelay: Infinity, // Recognizes '\r\n' and '\n' as line breaks
            });
            let bufferedLines = [];
            for await (const line of rl) {
                if (line.startsWith('data: ')) {
                    bufferedLines.push(line.slice(6).trim());
                }
                else if (line === '') {
                    if (bufferedLines.length === 0) {
                        continue; // no data to yield
                    }
                    yield JSON.parse(bufferedLines.join('\n'));
                    bufferedLines = []; // Reset the buffer after yielding
                }
                // Ignore other lines like comments or id fields
            }
        })();
    }
    getBaseUrl() {
        const endpoint = process.env['CODE_ASSIST_ENDPOINT'] ?? CODE_ASSIST_ENDPOINT;
        return `${endpoint}/${CODE_ASSIST_API_VERSION}`;
    }
    getMethodUrl(method) {
        return `${this.getBaseUrl()}:${method}`;
    }
    getOperationUrl(name) {
        return `${this.getBaseUrl()}/${name}`;
    }
}
function isVpcScAffectedUser(error) {
    if (error && typeof error === 'object' && 'response' in error) {
        const gaxiosError = error;
        const response = gaxiosError.response?.data;
        if (Array.isArray(response?.error?.details)) {
            return response.error.details.some((detail) => detail.reason === 'SECURITY_POLICY_VIOLATED');
        }
    }
    return false;
}
//# sourceMappingURL=server.js.map