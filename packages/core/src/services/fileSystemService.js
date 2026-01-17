/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import fs from 'node:fs/promises';
/**
 * Standard file system implementation
 */
export class StandardFileSystemService {
    async readTextFile(filePath) {
        return fs.readFile(filePath, 'utf-8');
    }
    async writeTextFile(filePath, content) {
        await fs.writeFile(filePath, content, 'utf-8');
    }
}
//# sourceMappingURL=fileSystemService.js.map