/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { EventEmitter } from 'node:events';
export var AppEvent;
(function (AppEvent) {
    AppEvent["OpenDebugConsole"] = "open-debug-console";
    AppEvent["OauthDisplayMessage"] = "oauth-display-message";
    AppEvent["Flicker"] = "flicker";
    AppEvent["McpClientUpdate"] = "mcp-client-update";
    AppEvent["SelectionWarning"] = "selection-warning";
    AppEvent["PasteTimeout"] = "paste-timeout";
})(AppEvent || (AppEvent = {}));
export const appEvents = new EventEmitter();
//# sourceMappingURL=events.js.map