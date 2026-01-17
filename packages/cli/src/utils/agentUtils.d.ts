/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AgentActionResult } from './agentSettings.js';
/**
 * Shared logic for building the core agent action message while allowing the
 * caller to control how each scope and its path are rendered (e.g., bolding or
 * dimming).
 *
 * This function ONLY returns the description of what happened. It is up to the
 * caller to append any interface-specific guidance.
 */
export declare function renderAgentActionFeedback(result: AgentActionResult, formatScope: (label: string, path: string) => string): string;
