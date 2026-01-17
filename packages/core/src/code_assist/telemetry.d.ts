/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type GenerateContentResponse } from '@google/genai';
import { type ConversationOffered, type StreamingLatency } from './types.js';
import type { CompletedToolCall } from '../core/coreToolScheduler.js';
import type { Config } from '../config/config.js';
import type { CodeAssistServer } from './server.js';
export declare function recordConversationOffered(server: CodeAssistServer, traceId: string | undefined, response: GenerateContentResponse, streamingLatency: StreamingLatency, abortSignal: AbortSignal | undefined): Promise<void>;
export declare function recordToolCallInteractions(config: Config, toolCalls: CompletedToolCall[]): Promise<void>;
export declare function createConversationOffered(response: GenerateContentResponse, traceId: string, signal: AbortSignal | undefined, streamingLatency: StreamingLatency): ConversationOffered | undefined;
export declare function formatProtoJsonDuration(milliseconds: number): string;
