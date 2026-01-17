/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { StartSessionEvent, UserPromptEvent, ToolCallEvent, ApiRequestEvent, ApiResponseEvent, ApiErrorEvent, LoopDetectedEvent, NextSpeakerCheckEvent, SlashCommandEvent, MalformedJsonResponseEvent, IdeConnectionEvent, ConversationFinishedEvent, ChatCompressionEvent, FileOperationEvent, InvalidChunkEvent, ContentRetryEvent, ContentRetryFailureEvent, ExtensionInstallEvent, ToolOutputTruncatedEvent, ExtensionUninstallEvent, ModelRoutingEvent, ExtensionEnableEvent, ModelSlashCommandEvent, ExtensionDisableEvent, EditStrategyEvent, EditCorrectionEvent, AgentStartEvent, AgentFinishEvent, RecoveryAttemptEvent, WebFetchFallbackAttemptEvent, ExtensionUpdateEvent, LlmLoopCheckEvent, HookCallEvent } from '../types.js';
import { EventMetadataKey } from './event-metadata-key.js';
import type { Config } from '../../config/config.js';
export declare enum EventNames {
    START_SESSION = "start_session",
    NEW_PROMPT = "new_prompt",
    TOOL_CALL = "tool_call",
    FILE_OPERATION = "file_operation",
    API_REQUEST = "api_request",
    API_RESPONSE = "api_response",
    API_ERROR = "api_error",
    END_SESSION = "end_session",
    FLASH_FALLBACK = "flash_fallback",
    RIPGREP_FALLBACK = "ripgrep_fallback",
    LOOP_DETECTED = "loop_detected",
    LOOP_DETECTION_DISABLED = "loop_detection_disabled",
    NEXT_SPEAKER_CHECK = "next_speaker_check",
    SLASH_COMMAND = "slash_command",
    MALFORMED_JSON_RESPONSE = "malformed_json_response",
    IDE_CONNECTION = "ide_connection",
    KITTY_SEQUENCE_OVERFLOW = "kitty_sequence_overflow",
    CHAT_COMPRESSION = "chat_compression",
    CONVERSATION_FINISHED = "conversation_finished",
    INVALID_CHUNK = "invalid_chunk",
    CONTENT_RETRY = "content_retry",
    CONTENT_RETRY_FAILURE = "content_retry_failure",
    EXTENSION_ENABLE = "extension_enable",
    EXTENSION_DISABLE = "extension_disable",
    EXTENSION_INSTALL = "extension_install",
    EXTENSION_UNINSTALL = "extension_uninstall",
    EXTENSION_UPDATE = "extension_update",
    TOOL_OUTPUT_TRUNCATED = "tool_output_truncated",
    MODEL_ROUTING = "model_routing",
    MODEL_SLASH_COMMAND = "model_slash_command",
    EDIT_STRATEGY = "edit_strategy",
    EDIT_CORRECTION = "edit_correction",
    AGENT_START = "agent_start",
    AGENT_FINISH = "agent_finish",
    RECOVERY_ATTEMPT = "recovery_attempt",
    WEB_FETCH_FALLBACK_ATTEMPT = "web_fetch_fallback_attempt",
    LLM_LOOP_CHECK = "llm_loop_check",
    HOOK_CALL = "hook_call"
}
export interface LogResponse {
    nextRequestWaitMs?: number;
}
export interface LogEventEntry {
    event_time_ms: number;
    source_extension_json: string;
    exp?: {
        gws_experiment: number[];
    };
}
export interface EventValue {
    gemini_cli_key: EventMetadataKey;
    value: string;
}
export interface LogEvent {
    console_type: 'GEMINI_CLI';
    application: number;
    event_name: string;
    event_metadata: EventValue[][];
    client_email?: string;
    client_install_id?: string;
}
export interface LogRequest {
    log_source_name: 'CONCORD';
    request_time_ms: number;
    log_event: LogEventEntry[][];
}
declare function refreshGpuInfo(): Promise<void>;
export declare class ClearcutLogger {
    private static instance;
    private config?;
    private sessionData;
    private promptId;
    private readonly installationManager;
    private readonly userAccountManager;
    private readonly hashedGHRepositoryName?;
    /**
     * Queue of pending events that need to be flushed to the server.  New events
     * are added to this queue and then flushed on demand (via `flushToClearcut`)
     */
    private readonly events;
    /**
     * The last time that the events were successfully flushed to the server.
     */
    private lastFlushTime;
    /**
     * the value is true when there is a pending flush happening. This prevents
     * concurrent flush operations.
     */
    private flushing;
    /**
     * This value is true when a flush was requested during an ongoing flush.
     */
    private pendingFlush;
    private constructor();
    static getInstance(config?: Config): ClearcutLogger | undefined;
    /** For testing purposes only. */
    static clearInstance(): void;
    enqueueHelper(event: LogEvent, experimentIds?: number[]): void;
    enqueueLogEvent(event: LogEvent): void;
    enqueueLogEventAfterExperimentsLoadAsync(event: LogEvent): Promise<void>;
    createBasicLogEvent(eventName: EventNames, data?: EventValue[]): LogEvent;
    createLogEvent(eventName: EventNames, data?: EventValue[]): LogEvent;
    flushIfNeeded(): void;
    flushToClearcut(): Promise<LogResponse>;
    logStartSessionEvent(event: StartSessionEvent): Promise<void>;
    logNewPromptEvent(event: UserPromptEvent): void;
    logToolCallEvent(event: ToolCallEvent): void;
    logFileOperationEvent(event: FileOperationEvent): void;
    logApiRequestEvent(event: ApiRequestEvent): void;
    logApiResponseEvent(event: ApiResponseEvent): void;
    logApiErrorEvent(event: ApiErrorEvent): void;
    logChatCompressionEvent(event: ChatCompressionEvent): void;
    logFlashFallbackEvent(): void;
    logRipgrepFallbackEvent(): void;
    logLoopDetectedEvent(event: LoopDetectedEvent): void;
    logLoopDetectionDisabledEvent(): void;
    logNextSpeakerCheck(event: NextSpeakerCheckEvent): void;
    logSlashCommandEvent(event: SlashCommandEvent): void;
    logMalformedJsonResponseEvent(event: MalformedJsonResponseEvent): void;
    logIdeConnectionEvent(event: IdeConnectionEvent): void;
    logConversationFinishedEvent(event: ConversationFinishedEvent): void;
    logEndSessionEvent(): void;
    logInvalidChunkEvent(event: InvalidChunkEvent): void;
    logContentRetryEvent(event: ContentRetryEvent): void;
    logContentRetryFailureEvent(event: ContentRetryFailureEvent): void;
    logExtensionInstallEvent(event: ExtensionInstallEvent): Promise<void>;
    logExtensionUninstallEvent(event: ExtensionUninstallEvent): Promise<void>;
    logExtensionUpdateEvent(event: ExtensionUpdateEvent): Promise<void>;
    logToolOutputTruncatedEvent(event: ToolOutputTruncatedEvent): void;
    logModelRoutingEvent(event: ModelRoutingEvent): void;
    logExtensionEnableEvent(event: ExtensionEnableEvent): Promise<void>;
    logModelSlashCommandEvent(event: ModelSlashCommandEvent): void;
    logExtensionDisableEvent(event: ExtensionDisableEvent): Promise<void>;
    logEditStrategyEvent(event: EditStrategyEvent): void;
    logEditCorrectionEvent(event: EditCorrectionEvent): void;
    logAgentStartEvent(event: AgentStartEvent): void;
    logAgentFinishEvent(event: AgentFinishEvent): void;
    logRecoveryAttemptEvent(event: RecoveryAttemptEvent): void;
    logWebFetchFallbackAttemptEvent(event: WebFetchFallbackAttemptEvent): void;
    logLlmLoopCheckEvent(event: LlmLoopCheckEvent): void;
    logHookCallEvent(event: HookCallEvent): void;
    /**
     * Adds default fields to data, and returns a new data array.  This fields
     * should exist on all log events.
     */
    addDefaultFields(data: EventValue[], totalAccounts: number): EventValue[];
    getProxyAgent(): HttpsProxyAgent<string> | undefined;
    getConfigJson(): string;
    shutdown(): void;
    private requeueFailedEvents;
}
export declare const TEST_ONLY: {
    MAX_RETRY_EVENTS: number;
    MAX_EVENTS: number;
    refreshGpuInfo: typeof refreshGpuInfo;
    resetCachedGpuInfoForTesting: () => void;
};
export {};
