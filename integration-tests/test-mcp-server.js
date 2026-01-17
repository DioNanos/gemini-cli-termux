/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { McpServer, } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import {} from 'node:http';
import {} from 'zod';
export class TestMcpServer {
    server;
    async start(tools) {
        const app = express();
        app.use(express.json());
        const mcpServer = new McpServer({
            name: 'test-mcp-server',
            version: '1.0.0',
        }, { capabilities: { tools: {} } });
        if (tools) {
            for (const [name, cb] of Object.entries(tools)) {
                mcpServer.registerTool(name, {}, cb);
            }
        }
        app.post('/mcp', async (req, res) => {
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
                enableJsonResponse: true,
            });
            res.on('close', () => {
                transport.close();
            });
            await mcpServer.connect(transport);
            await transport.handleRequest(req, res, req.body);
        });
        app.get('/mcp', async (req, res) => {
            res.status(405).send('Not supported');
        });
        return new Promise((resolve, reject) => {
            this.server = app.listen(0, () => {
                const address = this.server.address();
                if (address && typeof address !== 'string') {
                    resolve(address.port);
                }
                else {
                    reject(new Error('Could not determine server port.'));
                }
            });
            this.server.on('error', reject);
        });
    }
    async stop() {
        if (this.server) {
            await new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            this.server = undefined;
        }
    }
}
//# sourceMappingURL=test-mcp-server.js.map