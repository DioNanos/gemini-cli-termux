/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Part, Content } from '@google/genai';
import type { Config } from '../config/config.js';
export declare const INITIAL_HISTORY_LENGTH = 1;
/**
 * Generates a string describing the current workspace directories and their structures.
 * @param {Config} config - The runtime configuration and services.
 * @returns {Promise<string>} A promise that resolves to the directory context string.
 */
export declare function getDirectoryContextString(config: Config): Promise<string>;
/**
 * Retrieves environment-related information to be included in the chat context.
 * This includes the current working directory, date, operating system, and folder structure.
 * Optionally, it can also include the full file context if enabled.
 * @param {Config} config - The runtime configuration and services.
 * @returns A promise that resolves to an array of `Part` objects containing environment information.
 */
export declare function getEnvironmentContext(config: Config): Promise<Part[]>;
export declare function getInitialChatHistory(config: Config, extraHistory?: Content[]): Promise<Content[]>;
