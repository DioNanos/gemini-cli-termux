/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * ACP client-based implementation of FileSystemService
 */
export class AcpFileSystemService {
    connection;
    sessionId;
    capabilities;
    fallback;
    constructor(connection, sessionId, capabilities, fallback) {
        this.connection = connection;
        this.sessionId = sessionId;
        this.capabilities = capabilities;
        this.fallback = fallback;
    }
    async readTextFile(filePath) {
        if (!this.capabilities.readTextFile) {
            return this.fallback.readTextFile(filePath);
        }
        const response = await this.connection.readTextFile({
            path: filePath,
            sessionId: this.sessionId,
        });
        return response.content;
    }
    async writeTextFile(filePath, content) {
        if (!this.capabilities.writeTextFile) {
            return this.fallback.writeTextFile(filePath, content);
        }
        await this.connection.writeTextFile({
            path: filePath,
            content,
            sessionId: this.sessionId,
        });
    }
}
//# sourceMappingURL=fileSystemService.js.map