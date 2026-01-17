/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Integration test to verify circular reference handling with proxy agents
 */
import { describe, it, expect } from 'vitest';
import { ClearcutLogger } from './clearcut-logger/clearcut-logger.js';
describe('Circular Reference Integration Test', () => {
    it('should handle HttpsProxyAgent-like circular references in clearcut logging', () => {
        // Create a mock config with proxy
        const mockConfig = {
            getTelemetryEnabled: () => true,
            getUsageStatisticsEnabled: () => true,
            getSessionId: () => 'test-session',
            getModel: () => 'test-model',
            getEmbeddingModel: () => 'test-embedding',
            getDebugMode: () => false,
            getProxy: () => 'http://proxy.example.com:8080',
        };
        // Simulate the structure that causes the circular reference error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proxyAgentLike = {
            sockets: {},
            options: { proxy: 'http://proxy.example.com:8080' },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const socketLike = {
            _httpMessage: {
                agent: proxyAgentLike,
                socket: null,
            },
        };
        socketLike._httpMessage.socket = socketLike; // Create circular reference
        proxyAgentLike.sockets['cloudcode-pa.googleapis.com:443'] = [socketLike];
        // Create an event that would contain this circular structure
        const problematicEvent = {
            error: new Error('Network error'),
            function_args: {
                filePath: '/test/file.txt',
                httpAgent: proxyAgentLike, // This would cause the circular reference
            },
        };
        // Test that ClearcutLogger can handle this
        const logger = ClearcutLogger.getInstance(mockConfig);
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            logger?.enqueueLogEvent(problematicEvent);
        }).not.toThrow();
    });
});
//# sourceMappingURL=integration.test.circular.js.map