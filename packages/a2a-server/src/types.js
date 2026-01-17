/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Interfaces and enums for the CoderAgent protocol.
export var CoderAgentEvent;
(function (CoderAgentEvent) {
    /**
     * An event requesting one or more tool call confirmations.
     */
    CoderAgentEvent["ToolCallConfirmationEvent"] = "tool-call-confirmation";
    /**
     * An event updating on the status of one or more tool calls.
     */
    CoderAgentEvent["ToolCallUpdateEvent"] = "tool-call-update";
    /**
     * An event providing text updates on the task.
     */
    CoderAgentEvent["TextContentEvent"] = "text-content";
    /**
     * An event that indicates a change in the task's execution state.
     */
    CoderAgentEvent["StateChangeEvent"] = "state-change";
    /**
     * An user-sent event to initiate the agent.
     */
    CoderAgentEvent["StateAgentSettingsEvent"] = "agent-settings";
    /**
     * An event that contains a thought from the agent.
     */
    CoderAgentEvent["ThoughtEvent"] = "thought";
    /**
     * An event that contains citation from the agent.
     */
    CoderAgentEvent["CitationEvent"] = "citation";
})(CoderAgentEvent || (CoderAgentEvent = {}));
export const METADATA_KEY = '__persistedState';
export function getPersistedState(metadata) {
    return metadata?.[METADATA_KEY];
}
export function setPersistedState(metadata, state) {
    return {
        ...metadata,
        [METADATA_KEY]: state,
    };
}
//# sourceMappingURL=types.js.map