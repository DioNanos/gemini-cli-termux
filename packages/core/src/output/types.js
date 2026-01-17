/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export var OutputFormat;
(function (OutputFormat) {
    OutputFormat["TEXT"] = "text";
    OutputFormat["JSON"] = "json";
    OutputFormat["STREAM_JSON"] = "stream-json";
})(OutputFormat || (OutputFormat = {}));
// Streaming JSON event types
export var JsonStreamEventType;
(function (JsonStreamEventType) {
    JsonStreamEventType["INIT"] = "init";
    JsonStreamEventType["MESSAGE"] = "message";
    JsonStreamEventType["TOOL_USE"] = "tool_use";
    JsonStreamEventType["TOOL_RESULT"] = "tool_result";
    JsonStreamEventType["ERROR"] = "error";
    JsonStreamEventType["RESULT"] = "result";
})(JsonStreamEventType || (JsonStreamEventType = {}));
//# sourceMappingURL=types.js.map