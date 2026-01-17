/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export var PolicyDecision;
(function (PolicyDecision) {
    PolicyDecision["ALLOW"] = "allow";
    PolicyDecision["DENY"] = "deny";
    PolicyDecision["ASK_USER"] = "ask_user";
})(PolicyDecision || (PolicyDecision = {}));
/**
 * Array of valid hook source values for runtime validation
 */
const VALID_HOOK_SOURCES = [
    'project',
    'user',
    'system',
    'extension',
];
/**
 * Safely extract and validate hook source from input
 * Returns 'project' as default if the value is invalid or missing
 */
export function getHookSource(input) {
    const source = input['hook_source'];
    if (typeof source === 'string' &&
        VALID_HOOK_SOURCES.includes(source)) {
        return source;
    }
    return 'project';
}
export var ApprovalMode;
(function (ApprovalMode) {
    ApprovalMode["DEFAULT"] = "default";
    ApprovalMode["AUTO_EDIT"] = "autoEdit";
    ApprovalMode["YOLO"] = "yolo";
    ApprovalMode["PLAN"] = "plan";
})(ApprovalMode || (ApprovalMode = {}));
export var InProcessCheckerType;
(function (InProcessCheckerType) {
    InProcessCheckerType["ALLOWED_PATH"] = "allowed-path";
})(InProcessCheckerType || (InProcessCheckerType = {}));
//# sourceMappingURL=types.js.map