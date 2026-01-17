/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Types of user activities that can be tracked
 */
export var ActivityType;
(function (ActivityType) {
    ActivityType["USER_INPUT_START"] = "user_input_start";
    ActivityType["USER_INPUT_END"] = "user_input_end";
    ActivityType["MESSAGE_ADDED"] = "message_added";
    ActivityType["TOOL_CALL_SCHEDULED"] = "tool_call_scheduled";
    ActivityType["TOOL_CALL_COMPLETED"] = "tool_call_completed";
    ActivityType["STREAM_START"] = "stream_start";
    ActivityType["STREAM_END"] = "stream_end";
    ActivityType["HISTORY_UPDATED"] = "history_updated";
    ActivityType["MANUAL_TRIGGER"] = "manual_trigger";
})(ActivityType || (ActivityType = {}));
//# sourceMappingURL=activity-types.js.map