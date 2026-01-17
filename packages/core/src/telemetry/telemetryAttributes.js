/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { InstallationManager } from '../utils/installationManager.js';
import { UserAccountManager } from '../utils/userAccountManager.js';
const userAccountManager = new UserAccountManager();
const installationManager = new InstallationManager();
export function getCommonAttributes(config) {
    const email = userAccountManager.getCachedGoogleAccount();
    return {
        'session.id': config.getSessionId(),
        'installation.id': installationManager.getInstallationId(),
        interactive: config.isInteractive(),
        ...(email && { 'user.email': email }),
    };
}
//# sourceMappingURL=telemetryAttributes.js.map