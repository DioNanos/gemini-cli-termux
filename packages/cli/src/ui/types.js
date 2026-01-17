/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {} from 'react';
export var AuthState;
(function (AuthState) {
    // Attempting to authenticate or re-authenticate
    AuthState["Unauthenticated"] = "unauthenticated";
    // Auth dialog is open for user to select auth method
    AuthState["Updating"] = "updating";
    // Waiting for user to input API key
    AuthState["AwaitingApiKeyInput"] = "awaiting_api_key_input";
    // Successfully authenticated
    AuthState["Authenticated"] = "authenticated";
    // Waiting for the user to restart after a Google login
    AuthState["AwaitingGoogleLoginRestart"] = "awaiting_google_login_restart";
})(AuthState || (AuthState = {}));
// Only defining the state enum needed by the UI
export var StreamingState;
(function (StreamingState) {
    StreamingState["Idle"] = "idle";
    StreamingState["Responding"] = "responding";
    StreamingState["WaitingForConfirmation"] = "waiting_for_confirmation";
})(StreamingState || (StreamingState = {}));
// Copied from server/src/core/turn.ts for CLI usage
export var GeminiEventType;
(function (GeminiEventType) {
    GeminiEventType["Content"] = "content";
    GeminiEventType["ToolCallRequest"] = "tool_call_request";
    // Add other event types if the UI hook needs to handle them
})(GeminiEventType || (GeminiEventType = {}));
export var ToolCallStatus;
(function (ToolCallStatus) {
    ToolCallStatus["Pending"] = "Pending";
    ToolCallStatus["Canceled"] = "Canceled";
    ToolCallStatus["Confirming"] = "Confirming";
    ToolCallStatus["Executing"] = "Executing";
    ToolCallStatus["Success"] = "Success";
    ToolCallStatus["Error"] = "Error";
})(ToolCallStatus || (ToolCallStatus = {}));
/**
 * For use when you want no icon.
 */
export const emptyIcon = '  ';
// Message types used by internal command feedback (subset of HistoryItem types)
export var MessageType;
(function (MessageType) {
    MessageType["INFO"] = "info";
    MessageType["ERROR"] = "error";
    MessageType["WARNING"] = "warning";
    MessageType["USER"] = "user";
    MessageType["ABOUT"] = "about";
    MessageType["HELP"] = "help";
    MessageType["STATS"] = "stats";
    MessageType["MODEL_STATS"] = "model_stats";
    MessageType["TOOL_STATS"] = "tool_stats";
    MessageType["QUIT"] = "quit";
    MessageType["GEMINI"] = "gemini";
    MessageType["COMPRESSION"] = "compression";
    MessageType["EXTENSIONS_LIST"] = "extensions_list";
    MessageType["TOOLS_LIST"] = "tools_list";
    MessageType["SKILLS_LIST"] = "skills_list";
    MessageType["AGENTS_LIST"] = "agents_list";
    MessageType["MCP_STATUS"] = "mcp_status";
    MessageType["CHAT_LIST"] = "chat_list";
    MessageType["HOOKS_LIST"] = "hooks_list";
})(MessageType || (MessageType = {}));
//# sourceMappingURL=types.js.map