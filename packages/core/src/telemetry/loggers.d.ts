/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { ApiErrorEvent, ApiRequestEvent, ApiResponseEvent, FileOperationEvent, IdeConnectionEvent, StartSessionEvent, ToolCallEvent, UserPromptEvent, FlashFallbackEvent, NextSpeakerCheckEvent, LoopDetectedEvent, LoopDetectionDisabledEvent, SlashCommandEvent, ConversationFinishedEvent, ChatCompressionEvent, MalformedJsonResponseEvent, InvalidChunkEvent, ContentRetryEvent, ContentRetryFailureEvent, RipgrepFallbackEvent, ToolOutputTruncatedEvent, ModelRoutingEvent, ExtensionDisableEvent, ExtensionEnableEvent, ExtensionUninstallEvent, ExtensionInstallEvent, ModelSlashCommandEvent, EditStrategyEvent, EditCorrectionEvent, AgentStartEvent, AgentFinishEvent, RecoveryAttemptEvent, WebFetchFallbackAttemptEvent, ExtensionUpdateEvent, LlmLoopCheckEvent, HookCallEvent, StartupStatsEvent } from './types.js';
export declare function logCliConfiguration(config: Config, event: StartSessionEvent): void;
export declare function logUserPrompt(config: Config, event: UserPromptEvent): void;
export declare function logToolCall(config: Config, event: ToolCallEvent): void;
export declare function logToolOutputTruncated(config: Config, event: ToolOutputTruncatedEvent): void;
export declare function logFileOperation(config: Config, event: FileOperationEvent): void;
export declare function logApiRequest(config: Config, event: ApiRequestEvent): void;
export declare function logFlashFallback(config: Config, event: FlashFallbackEvent): void;
export declare function logRipgrepFallback(config: Config, event: RipgrepFallbackEvent): void;
export declare function logApiError(config: Config, event: ApiErrorEvent): void;
export declare function logApiResponse(config: Config, event: ApiResponseEvent): void;
export declare function logLoopDetected(config: Config, event: LoopDetectedEvent): void;
export declare function logLoopDetectionDisabled(config: Config, event: LoopDetectionDisabledEvent): void;
export declare function logNextSpeakerCheck(config: Config, event: NextSpeakerCheckEvent): void;
export declare function logSlashCommand(config: Config, event: SlashCommandEvent): void;
export declare function logIdeConnection(config: Config, event: IdeConnectionEvent): void;
export declare function logConversationFinishedEvent(config: Config, event: ConversationFinishedEvent): void;
export declare function logChatCompression(config: Config, event: ChatCompressionEvent): void;
export declare function logMalformedJsonResponse(config: Config, event: MalformedJsonResponseEvent): void;
export declare function logInvalidChunk(config: Config, event: InvalidChunkEvent): void;
export declare function logContentRetry(config: Config, event: ContentRetryEvent): void;
export declare function logContentRetryFailure(config: Config, event: ContentRetryFailureEvent): void;
export declare function logModelRouting(config: Config, event: ModelRoutingEvent): void;
export declare function logModelSlashCommand(config: Config, event: ModelSlashCommandEvent): void;
export declare function logExtensionInstallEvent(config: Config, event: ExtensionInstallEvent): Promise<void>;
export declare function logExtensionUninstall(config: Config, event: ExtensionUninstallEvent): Promise<void>;
export declare function logExtensionUpdateEvent(config: Config, event: ExtensionUpdateEvent): Promise<void>;
export declare function logExtensionEnable(config: Config, event: ExtensionEnableEvent): Promise<void>;
export declare function logExtensionDisable(config: Config, event: ExtensionDisableEvent): Promise<void>;
export declare function logEditStrategy(config: Config, event: EditStrategyEvent): void;
export declare function logEditCorrectionEvent(config: Config, event: EditCorrectionEvent): void;
export declare function logAgentStart(config: Config, event: AgentStartEvent): void;
export declare function logAgentFinish(config: Config, event: AgentFinishEvent): void;
export declare function logRecoveryAttempt(config: Config, event: RecoveryAttemptEvent): void;
export declare function logWebFetchFallbackAttempt(config: Config, event: WebFetchFallbackAttemptEvent): void;
export declare function logLlmLoopCheck(config: Config, event: LlmLoopCheckEvent): void;
export declare function logHookCall(config: Config, event: HookCallEvent): void;
export declare function logStartupStats(config: Config, event: StartupStatsEvent): void;
