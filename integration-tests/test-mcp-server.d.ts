/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type ZodRawShape } from 'zod';
export declare class TestMcpServer {
    private server;
    start(tools?: Record<string, ToolCallback<ZodRawShape>>): Promise<number>;
    stop(): Promise<void>;
}
