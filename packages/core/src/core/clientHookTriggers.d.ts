/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PartListUnion } from '@google/genai';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { type DefaultHookOutput } from '../hooks/types.js';
/**
 * Fires the BeforeAgent hook and returns the hook output.
 * This should be called before processing a user prompt.
 *
 * The caller can use the returned DefaultHookOutput methods:
 * - isBlockingDecision() / shouldStopExecution() to check if blocked
 * - getEffectiveReason() to get the blocking reason
 * - getAdditionalContext() to get additional context to add
 *
 * @param messageBus The message bus to use for hook communication
 * @param request The user's request (prompt)
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export declare function fireBeforeAgentHook(messageBus: MessageBus, request: PartListUnion): Promise<DefaultHookOutput | undefined>;
/**
 * Fires the AfterAgent hook and returns the hook output.
 * This should be called after the agent has generated a response.
 *
 * The caller can use the returned DefaultHookOutput methods:
 * - isBlockingDecision() / shouldStopExecution() to check if continuation is requested
 * - getEffectiveReason() to get the continuation reason
 *
 * @param messageBus The message bus to use for hook communication
 * @param request The original user's request (prompt)
 * @param responseText The agent's response text
 * @returns The hook output, or undefined if no hook was executed or on error
 */
export declare function fireAfterAgentHook(messageBus: MessageBus, request: PartListUnion, responseText: string): Promise<DefaultHookOutput | undefined>;
