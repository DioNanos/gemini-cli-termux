/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
/**
 * List of predefined reason codes when a tier is blocked from a specific tier.
 * https://source.corp.google.com/piper///depot/google3/google/internal/cloud/code/v1internal/cloudcode.proto;l=378
 */
export var IneligibleTierReasonCode;
(function (IneligibleTierReasonCode) {
    // go/keep-sorted start
    IneligibleTierReasonCode["DASHER_USER"] = "DASHER_USER";
    IneligibleTierReasonCode["INELIGIBLE_ACCOUNT"] = "INELIGIBLE_ACCOUNT";
    IneligibleTierReasonCode["NON_USER_ACCOUNT"] = "NON_USER_ACCOUNT";
    IneligibleTierReasonCode["RESTRICTED_AGE"] = "RESTRICTED_AGE";
    IneligibleTierReasonCode["RESTRICTED_NETWORK"] = "RESTRICTED_NETWORK";
    IneligibleTierReasonCode["UNKNOWN"] = "UNKNOWN";
    IneligibleTierReasonCode["UNKNOWN_LOCATION"] = "UNKNOWN_LOCATION";
    IneligibleTierReasonCode["UNSUPPORTED_LOCATION"] = "UNSUPPORTED_LOCATION";
    // go/keep-sorted end
})(IneligibleTierReasonCode || (IneligibleTierReasonCode = {}));
/**
 * UserTierId represents IDs returned from the Cloud Code Private API representing a user's tier
 *
 * //depot/google3/cloud/developer_experience/cloudcode/pa/service/usertier.go;l=16
 */
export var UserTierId;
(function (UserTierId) {
    UserTierId["FREE"] = "free-tier";
    UserTierId["LEGACY"] = "legacy-tier";
    UserTierId["STANDARD"] = "standard-tier";
})(UserTierId || (UserTierId = {}));
/**
 * Status code of user license status
 * it does not strictly correspond to the proto
 * Error value is an additional value assigned to error responses from OnboardUser
 */
export var OnboardUserStatusCode;
(function (OnboardUserStatusCode) {
    OnboardUserStatusCode["Default"] = "DEFAULT";
    OnboardUserStatusCode["Notice"] = "NOTICE";
    OnboardUserStatusCode["Warning"] = "WARNING";
    OnboardUserStatusCode["Error"] = "ERROR";
})(OnboardUserStatusCode || (OnboardUserStatusCode = {}));
export var ConversationInteractionInteraction;
(function (ConversationInteractionInteraction) {
    ConversationInteractionInteraction[ConversationInteractionInteraction["UNKNOWN"] = 0] = "UNKNOWN";
    ConversationInteractionInteraction[ConversationInteractionInteraction["THUMBSUP"] = 1] = "THUMBSUP";
    ConversationInteractionInteraction[ConversationInteractionInteraction["THUMBSDOWN"] = 2] = "THUMBSDOWN";
    ConversationInteractionInteraction[ConversationInteractionInteraction["COPY"] = 3] = "COPY";
    ConversationInteractionInteraction[ConversationInteractionInteraction["INSERT"] = 4] = "INSERT";
    ConversationInteractionInteraction[ConversationInteractionInteraction["ACCEPT_CODE_BLOCK"] = 5] = "ACCEPT_CODE_BLOCK";
    ConversationInteractionInteraction[ConversationInteractionInteraction["ACCEPT_ALL"] = 6] = "ACCEPT_ALL";
    ConversationInteractionInteraction[ConversationInteractionInteraction["ACCEPT_FILE"] = 7] = "ACCEPT_FILE";
    ConversationInteractionInteraction[ConversationInteractionInteraction["DIFF"] = 8] = "DIFF";
    ConversationInteractionInteraction[ConversationInteractionInteraction["ACCEPT_RANGE"] = 9] = "ACCEPT_RANGE";
})(ConversationInteractionInteraction || (ConversationInteractionInteraction = {}));
export var ActionStatus;
(function (ActionStatus) {
    ActionStatus[ActionStatus["ACTION_STATUS_UNSPECIFIED"] = 0] = "ACTION_STATUS_UNSPECIFIED";
    ActionStatus[ActionStatus["ACTION_STATUS_NO_ERROR"] = 1] = "ACTION_STATUS_NO_ERROR";
    ActionStatus[ActionStatus["ACTION_STATUS_ERROR_UNKNOWN"] = 2] = "ACTION_STATUS_ERROR_UNKNOWN";
    ActionStatus[ActionStatus["ACTION_STATUS_CANCELLED"] = 3] = "ACTION_STATUS_CANCELLED";
    ActionStatus[ActionStatus["ACTION_STATUS_EMPTY"] = 4] = "ACTION_STATUS_EMPTY";
})(ActionStatus || (ActionStatus = {}));
export var InitiationMethod;
(function (InitiationMethod) {
    InitiationMethod[InitiationMethod["INITIATION_METHOD_UNSPECIFIED"] = 0] = "INITIATION_METHOD_UNSPECIFIED";
    InitiationMethod[InitiationMethod["TAB"] = 1] = "TAB";
    InitiationMethod[InitiationMethod["COMMAND"] = 2] = "COMMAND";
    InitiationMethod[InitiationMethod["AGENT"] = 3] = "AGENT";
})(InitiationMethod || (InitiationMethod = {}));
const ExtensionsSettingSchema = z.object({
    extensionsEnabled: z.boolean().optional(),
});
const CliFeatureSettingSchema = z.object({
    extensionsSetting: ExtensionsSettingSchema.optional(),
});
const McpSettingSchema = z.object({
    mcpEnabled: z.boolean().optional(),
    overrideMcpConfigJson: z.string().optional(),
});
export const FetchAdminControlsResponseSchema = z.object({
    secureModeEnabled: z.boolean().optional(),
    mcpSetting: McpSettingSchema.optional(),
    cliFeatureSetting: CliFeatureSettingSchema.optional(),
});
//# sourceMappingURL=types.js.map