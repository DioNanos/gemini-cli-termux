/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {} from 'zod';
/**
 * Describes the possible termination modes for an agent.
 */
export var AgentTerminateMode;
(function (AgentTerminateMode) {
    AgentTerminateMode["ERROR"] = "ERROR";
    AgentTerminateMode["TIMEOUT"] = "TIMEOUT";
    AgentTerminateMode["GOAL"] = "GOAL";
    AgentTerminateMode["MAX_TURNS"] = "MAX_TURNS";
    AgentTerminateMode["ABORTED"] = "ABORTED";
    AgentTerminateMode["ERROR_NO_COMPLETE_TASK_CALL"] = "ERROR_NO_COMPLETE_TASK_CALL";
})(AgentTerminateMode || (AgentTerminateMode = {}));
//# sourceMappingURL=types.js.map