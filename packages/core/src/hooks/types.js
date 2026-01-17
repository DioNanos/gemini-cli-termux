/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { defaultHookTranslator } from './hookTranslator.js';
/**
 * Configuration source levels in precedence order (highest to lowest)
 */
export var ConfigSource;
(function (ConfigSource) {
    ConfigSource["Project"] = "project";
    ConfigSource["User"] = "user";
    ConfigSource["System"] = "system";
    ConfigSource["Extensions"] = "extensions";
})(ConfigSource || (ConfigSource = {}));
/**
 * Event names for the hook system
 */
export var HookEventName;
(function (HookEventName) {
    HookEventName["BeforeTool"] = "BeforeTool";
    HookEventName["AfterTool"] = "AfterTool";
    HookEventName["BeforeAgent"] = "BeforeAgent";
    HookEventName["Notification"] = "Notification";
    HookEventName["AfterAgent"] = "AfterAgent";
    HookEventName["SessionStart"] = "SessionStart";
    HookEventName["SessionEnd"] = "SessionEnd";
    HookEventName["PreCompress"] = "PreCompress";
    HookEventName["BeforeModel"] = "BeforeModel";
    HookEventName["AfterModel"] = "AfterModel";
    HookEventName["BeforeToolSelection"] = "BeforeToolSelection";
})(HookEventName || (HookEventName = {}));
/**
 * Fields in the hooks configuration that are not hook event names
 */
export const HOOKS_CONFIG_FIELDS = ['enabled', 'disabled', 'notifications'];
/**
 * Hook implementation types
 */
export var HookType;
(function (HookType) {
    HookType["Command"] = "command";
})(HookType || (HookType = {}));
/**
 * Generate a unique key for a hook configuration
 */
export function getHookKey(hook) {
    const name = hook.name || '';
    const command = hook.command || '';
    return `${name}:${command}`;
}
/**
 * Factory function to create the appropriate hook output class based on event name
 * Returns DefaultHookOutput for all events since it contains all necessary methods
 */
export function createHookOutput(eventName, data) {
    switch (eventName) {
        case 'BeforeModel':
            return new BeforeModelHookOutput(data);
        case 'AfterModel':
            return new AfterModelHookOutput(data);
        case 'BeforeToolSelection':
            return new BeforeToolSelectionHookOutput(data);
        case 'BeforeTool':
            return new BeforeToolHookOutput(data);
        default:
            return new DefaultHookOutput(data);
    }
}
/**
 * Default implementation of HookOutput with utility methods
 */
export class DefaultHookOutput {
    continue;
    stopReason;
    suppressOutput;
    systemMessage;
    decision;
    reason;
    hookSpecificOutput;
    constructor(data = {}) {
        this.continue = data.continue;
        this.stopReason = data.stopReason;
        this.suppressOutput = data.suppressOutput;
        this.systemMessage = data.systemMessage;
        this.decision = data.decision;
        this.reason = data.reason;
        this.hookSpecificOutput = data.hookSpecificOutput;
    }
    /**
     * Check if this output represents a blocking decision
     */
    isBlockingDecision() {
        return this.decision === 'block' || this.decision === 'deny';
    }
    /**
     * Check if this output requests to stop execution
     */
    shouldStopExecution() {
        return this.continue === false;
    }
    /**
     * Get the effective reason for blocking or stopping
     */
    getEffectiveReason() {
        return this.stopReason || this.reason || 'No reason provided';
    }
    /**
     * Apply LLM request modifications (specific method for BeforeModel hooks)
     */
    applyLLMRequestModifications(target) {
        // Base implementation - overridden by BeforeModelHookOutput
        return target;
    }
    /**
     * Apply tool config modifications (specific method for BeforeToolSelection hooks)
     */
    applyToolConfigModifications(target) {
        // Base implementation - overridden by BeforeToolSelectionHookOutput
        return target;
    }
    /**
     * Get additional context for adding to responses
     */
    getAdditionalContext() {
        if (this.hookSpecificOutput &&
            'additionalContext' in this.hookSpecificOutput) {
            const context = this.hookSpecificOutput['additionalContext'];
            return typeof context === 'string' ? context : undefined;
        }
        return undefined;
    }
    /**
     * Check if execution should be blocked and return error info
     */
    getBlockingError() {
        if (this.isBlockingDecision()) {
            return {
                blocked: true,
                reason: this.getEffectiveReason(),
            };
        }
        return { blocked: false, reason: '' };
    }
}
/**
 * Specific hook output class for BeforeTool events.
 */
export class BeforeToolHookOutput extends DefaultHookOutput {
    /**
     * Get modified tool input if provided by hook
     */
    getModifiedToolInput() {
        if (this.hookSpecificOutput && 'tool_input' in this.hookSpecificOutput) {
            const input = this.hookSpecificOutput['tool_input'];
            if (typeof input === 'object' &&
                input !== null &&
                !Array.isArray(input)) {
                return input;
            }
        }
        return undefined;
    }
}
/**
 * Specific hook output class for BeforeModel events
 */
export class BeforeModelHookOutput extends DefaultHookOutput {
    /**
     * Get synthetic LLM response if provided by hook
     */
    getSyntheticResponse() {
        if (this.hookSpecificOutput && 'llm_response' in this.hookSpecificOutput) {
            const hookResponse = this.hookSpecificOutput['llm_response'];
            if (hookResponse) {
                // Convert hook format to SDK format
                return defaultHookTranslator.fromHookLLMResponse(hookResponse);
            }
        }
        return undefined;
    }
    /**
     * Apply modifications to LLM request
     */
    applyLLMRequestModifications(target) {
        if (this.hookSpecificOutput && 'llm_request' in this.hookSpecificOutput) {
            const hookRequest = this.hookSpecificOutput['llm_request'];
            if (hookRequest) {
                // Convert hook format to SDK format
                const sdkRequest = defaultHookTranslator.fromHookLLMRequest(hookRequest, target);
                return {
                    ...target,
                    ...sdkRequest,
                };
            }
        }
        return target;
    }
}
/**
 * Specific hook output class for BeforeToolSelection events
 */
export class BeforeToolSelectionHookOutput extends DefaultHookOutput {
    /**
     * Apply tool configuration modifications
     */
    applyToolConfigModifications(target) {
        if (this.hookSpecificOutput && 'toolConfig' in this.hookSpecificOutput) {
            const hookToolConfig = this.hookSpecificOutput['toolConfig'];
            if (hookToolConfig) {
                // Convert hook format to SDK format
                const sdkToolConfig = defaultHookTranslator.fromHookToolConfig(hookToolConfig);
                return {
                    ...target,
                    tools: target.tools || [],
                    toolConfig: sdkToolConfig,
                };
            }
        }
        return target;
    }
}
/**
 * Specific hook output class for AfterModel events
 */
export class AfterModelHookOutput extends DefaultHookOutput {
    /**
     * Get modified LLM response if provided by hook
     */
    getModifiedResponse() {
        if (this.hookSpecificOutput && 'llm_response' in this.hookSpecificOutput) {
            const hookResponse = this.hookSpecificOutput['llm_response'];
            if (hookResponse?.candidates?.[0]?.content?.parts?.length) {
                // Convert hook format to SDK format
                return defaultHookTranslator.fromHookLLMResponse(hookResponse);
            }
        }
        return undefined;
    }
}
/**
 * Notification types
 */
export var NotificationType;
(function (NotificationType) {
    NotificationType["ToolPermission"] = "ToolPermission";
})(NotificationType || (NotificationType = {}));
/**
 * SessionStart source types
 */
export var SessionStartSource;
(function (SessionStartSource) {
    SessionStartSource["Startup"] = "startup";
    SessionStartSource["Resume"] = "resume";
    SessionStartSource["Clear"] = "clear";
})(SessionStartSource || (SessionStartSource = {}));
/**
 * SessionEnd reason types
 */
export var SessionEndReason;
(function (SessionEndReason) {
    SessionEndReason["Exit"] = "exit";
    SessionEndReason["Clear"] = "clear";
    SessionEndReason["Logout"] = "logout";
    SessionEndReason["PromptInputExit"] = "prompt_input_exit";
    SessionEndReason["Other"] = "other";
})(SessionEndReason || (SessionEndReason = {}));
/**
 * PreCompress trigger types
 */
export var PreCompressTrigger;
(function (PreCompressTrigger) {
    PreCompressTrigger["Manual"] = "manual";
    PreCompressTrigger["Auto"] = "auto";
})(PreCompressTrigger || (PreCompressTrigger = {}));
//# sourceMappingURL=types.js.map