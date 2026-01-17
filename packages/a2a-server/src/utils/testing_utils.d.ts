/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SendStreamingMessageSuccessResponse } from '@a2a-js/sdk';
import type { Config } from '@google/gemini-cli-core';
export declare function createMockConfig(overrides?: Partial<Config>): Partial<Config>;
export declare function createStreamMessageRequest(text: string, messageId: string, taskId?: string): {
    jsonrpc: string;
    id: string;
    method: string;
    params: {
        message: {
            kind: string;
            role: string;
            parts: [{
                kind: string;
                text: string;
            }];
            messageId: string;
        };
        metadata: {
            coderAgent: {
                kind: string;
                workspacePath: string;
            };
        };
        taskId?: string;
    };
};
export declare function assertUniqueFinalEventIsLast(events: SendStreamingMessageSuccessResponse[]): void;
export declare function assertTaskCreationAndWorkingStatus(events: SendStreamingMessageSuccessResponse[]): void;
