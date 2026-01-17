/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {} from '@google/genai';
export var MessageBusType;
(function (MessageBusType) {
    MessageBusType["TOOL_CONFIRMATION_REQUEST"] = "tool-confirmation-request";
    MessageBusType["TOOL_CONFIRMATION_RESPONSE"] = "tool-confirmation-response";
    MessageBusType["TOOL_POLICY_REJECTION"] = "tool-policy-rejection";
    MessageBusType["TOOL_EXECUTION_SUCCESS"] = "tool-execution-success";
    MessageBusType["TOOL_EXECUTION_FAILURE"] = "tool-execution-failure";
    MessageBusType["UPDATE_POLICY"] = "update-policy";
    MessageBusType["HOOK_EXECUTION_REQUEST"] = "hook-execution-request";
    MessageBusType["HOOK_EXECUTION_RESPONSE"] = "hook-execution-response";
    MessageBusType["HOOK_POLICY_DECISION"] = "hook-policy-decision";
    MessageBusType["TOOL_CALLS_UPDATE"] = "tool-calls-update";
})(MessageBusType || (MessageBusType = {}));
//# sourceMappingURL=types.js.map