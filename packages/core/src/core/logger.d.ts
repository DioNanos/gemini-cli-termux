/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Content } from '@google/genai';
import type { AuthType } from './contentGenerator.js';
import type { Storage } from '../config/storage.js';
export declare enum MessageSenderType {
    USER = "user"
}
export interface LogEntry {
    sessionId: string;
    messageId: number;
    timestamp: string;
    type: MessageSenderType;
    message: string;
}
export interface Checkpoint {
    history: Content[];
    authType?: AuthType;
}
/**
 * Encodes a string to be safe for use as a filename.
 *
 * It replaces any characters that are not alphanumeric or one of `_`, `-`, `.`
 * with a URL-like percent-encoding (`%` followed by the 2-digit hex code).
 *
 * @param str The input string to encode.
 * @returns The encoded, filename-safe string.
 */
export declare function encodeTagName(str: string): string;
/**
 * Decodes a string that was encoded with the `encode` function.
 *
 * It finds any percent-encoded characters and converts them back to their
 * original representation.
 *
 * @param str The encoded string to decode.
 * @returns The decoded, original string.
 */
export declare function decodeTagName(str: string): string;
export declare class Logger {
    private readonly storage;
    private geminiDir;
    private logFilePath;
    private sessionId;
    private messageId;
    private initialized;
    private logs;
    constructor(sessionId: string, storage: Storage);
    private _readLogFile;
    private _backupCorruptedLogFile;
    initialize(): Promise<void>;
    private _updateLogFile;
    getPreviousUserMessages(): Promise<string[]>;
    logMessage(type: MessageSenderType, message: string): Promise<void>;
    private _checkpointPath;
    private _getCheckpointPath;
    saveCheckpoint(checkpoint: Checkpoint, tag: string): Promise<void>;
    loadCheckpoint(tag: string): Promise<Checkpoint>;
    deleteCheckpoint(tag: string): Promise<boolean>;
    checkpointExists(tag: string): Promise<boolean>;
    close(): void;
}
