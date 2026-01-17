/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { EventEmitter } from 'node:events';
/**
 * Defines the severity level for user-facing feedback.
 * This maps loosely to UI `MessageType`
 */
export type FeedbackSeverity = 'info' | 'warning' | 'error';
/**
 * Payload for the 'user-feedback' event.
 */
export interface UserFeedbackPayload {
    /**
     * The severity level determines how the message is rendered in the UI
     * (e.g. colored text, specific icon).
     */
    severity: FeedbackSeverity;
    /**
     * The main message to display to the user in the chat history or stdout.
     */
    message: string;
    /**
     * The original error object, if applicable.
     * Listeners can use this to extract stack traces for debug logging
     * or verbose output, while keeping the 'message' field clean for end users.
     */
    error?: unknown;
}
/**
 * Payload for the 'model-changed' event.
 */
export interface ModelChangedPayload {
    /**
     * The new model that was set.
     */
    model: string;
}
/**
 * Payload for the 'console-log' event.
 */
export interface ConsoleLogPayload {
    type: 'log' | 'warn' | 'error' | 'debug' | 'info';
    content: string;
}
/**
 * Payload for the 'output' event.
 */
export interface OutputPayload {
    isStderr: boolean;
    chunk: Uint8Array | string;
    encoding?: BufferEncoding;
}
/**
 * Payload for the 'memory-changed' event.
 */
export interface MemoryChangedPayload {
    fileCount: number;
}
/**
 * Base payload for hook-related events.
 */
export interface HookPayload {
    hookName: string;
    eventName: string;
}
/**
 * Payload for the 'hook-start' event.
 */
export interface HookStartPayload extends HookPayload {
    /**
     * The 1-based index of the current hook in the execution sequence.
     * Used for progress indication (e.g. "Hook 1/3").
     */
    hookIndex?: number;
    /**
     * The total number of hooks in the current execution sequence.
     */
    totalHooks?: number;
}
/**
 * Payload for the 'hook-end' event.
 */
export interface HookEndPayload extends HookPayload {
    success: boolean;
}
/**
 * Payload for the 'retry-attempt' event.
 */
export interface RetryAttemptPayload {
    attempt: number;
    maxAttempts: number;
    delayMs: number;
    error?: string;
    model: string;
}
export declare enum CoreEvent {
    UserFeedback = "user-feedback",
    ModelChanged = "model-changed",
    ConsoleLog = "console-log",
    Output = "output",
    MemoryChanged = "memory-changed",
    ExternalEditorClosed = "external-editor-closed",
    SettingsChanged = "settings-changed",
    HookStart = "hook-start",
    HookEnd = "hook-end",
    AgentsRefreshed = "agents-refreshed",
    AdminSettingsChanged = "admin-settings-changed",
    RetryAttempt = "retry-attempt"
}
export interface CoreEvents {
    [CoreEvent.UserFeedback]: [UserFeedbackPayload];
    [CoreEvent.ModelChanged]: [ModelChangedPayload];
    [CoreEvent.ConsoleLog]: [ConsoleLogPayload];
    [CoreEvent.Output]: [OutputPayload];
    [CoreEvent.MemoryChanged]: [MemoryChangedPayload];
    [CoreEvent.ExternalEditorClosed]: never[];
    [CoreEvent.SettingsChanged]: never[];
    [CoreEvent.HookStart]: [HookStartPayload];
    [CoreEvent.HookEnd]: [HookEndPayload];
    [CoreEvent.AgentsRefreshed]: never[];
    [CoreEvent.AdminSettingsChanged]: never[];
    [CoreEvent.RetryAttempt]: [RetryAttemptPayload];
}
export declare class CoreEventEmitter extends EventEmitter<CoreEvents> {
    private _eventBacklog;
    private static readonly MAX_BACKLOG_SIZE;
    constructor();
    private _emitOrQueue;
    /**
     * Sends actionable feedback to the user.
     * Buffers automatically if the UI hasn't subscribed yet.
     */
    emitFeedback(severity: FeedbackSeverity, message: string, error?: unknown): void;
    /**
     * Broadcasts a console log message.
     */
    emitConsoleLog(type: 'log' | 'warn' | 'error' | 'debug' | 'info', content: string): void;
    /**
     * Broadcasts stdout/stderr output.
     */
    emitOutput(isStderr: boolean, chunk: Uint8Array | string, encoding?: BufferEncoding): void;
    /**
     * Notifies subscribers that the model has changed.
     */
    emitModelChanged(model: string): void;
    /**
     * Notifies subscribers that settings have been modified.
     */
    emitSettingsChanged(): void;
    /**
     * Notifies subscribers that a hook execution has started.
     */
    emitHookStart(payload: HookStartPayload): void;
    /**
     * Notifies subscribers that a hook execution has ended.
     */
    emitHookEnd(payload: HookEndPayload): void;
    /**
     * Notifies subscribers that agents have been refreshed.
     */
    emitAgentsRefreshed(): void;
    /**
     * Notifies subscribers that admin settings have changed.
     */
    emitAdminSettingsChanged(): void;
    /**
     * Notifies subscribers that a retry attempt is happening.
     */
    emitRetryAttempt(payload: RetryAttemptPayload): void;
    /**
     * Flushes buffered messages. Call this immediately after primary UI listener
     * subscribes.
     */
    drainBacklogs(): void;
}
export declare const coreEvents: CoreEventEmitter;
