/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { INSTALL_METADATA_FILENAME } from './extensions/variables.js';
export function loadInstallMetadata(extensionDir) {
    const metadataFilePath = path.join(extensionDir, INSTALL_METADATA_FILENAME);
    try {
        const configContent = fs.readFileSync(metadataFilePath, 'utf-8');
        const metadata = JSON.parse(configContent);
        return metadata;
    }
    catch (_e) {
        return undefined;
    }
}
//# sourceMappingURL=extension.js.map