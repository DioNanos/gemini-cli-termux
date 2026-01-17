/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GitService } from '../services/gitService.js';
import type { GeminiClient } from '../core/client.js';
import { z } from 'zod';
import type { Content } from '@google/genai';
import type { ToolCallRequestInfo } from '../scheduler/types.js';
export interface ToolCallData<HistoryType = unknown, ArgsType = unknown> {
    history?: HistoryType;
    clientHistory?: Content[];
    commitHash?: string;
    toolCall: {
        name: string;
        args: ArgsType;
    };
    messageId?: string;
}
export declare function getToolCallDataSchema(historyItemSchema?: z.ZodTypeAny): z.ZodObject<{
    history: z.ZodOptional<z.ZodArray<z.ZodTypeAny, "many">>;
    clientHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodOptional<z.ZodString>;
        parts: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        role: z.ZodOptional<z.ZodString>;
        parts: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        role: z.ZodOptional<z.ZodString>;
        parts: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    commitHash: z.ZodOptional<z.ZodString>;
    toolCall: z.ZodObject<{
        name: z.ZodString;
        args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        args: Record<string, unknown>;
    }, {
        name: string;
        args: Record<string, unknown>;
    }>;
    messageId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    toolCall: {
        name: string;
        args: Record<string, unknown>;
    };
    history?: any[] | undefined;
    clientHistory?: z.objectOutputType<{
        role: z.ZodOptional<z.ZodString>;
        parts: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    commitHash?: string | undefined;
    messageId?: string | undefined;
}, {
    toolCall: {
        name: string;
        args: Record<string, unknown>;
    };
    history?: any[] | undefined;
    clientHistory?: z.objectInputType<{
        role: z.ZodOptional<z.ZodString>;
        parts: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
    commitHash?: string | undefined;
    messageId?: string | undefined;
}>;
export declare function generateCheckpointFileName(toolCall: ToolCallRequestInfo): string | null;
export declare function formatCheckpointDisplayList(filenames: string[]): string;
export declare function getTruncatedCheckpointNames(filenames: string[]): string[];
export declare function processRestorableToolCalls<HistoryType>(toolCalls: ToolCallRequestInfo[], gitService: GitService, geminiClient: GeminiClient, history?: HistoryType): Promise<{
    checkpointsToWrite: Map<string, string>;
    toolCallToCheckpointMap: Map<string, string>;
    errors: string[];
}>;
export interface CheckpointInfo {
    messageId: string;
    checkpoint: string;
}
export declare function getCheckpointInfoList(checkpointFiles: Map<string, string>): CheckpointInfo[];
