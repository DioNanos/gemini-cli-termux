/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AgentInputs } from './types.js';
/**
 * Replaces `${...}` placeholders in a template string with values from AgentInputs.
 *
 * @param template The template string containing placeholders.
 * @param inputs The AgentInputs object providing placeholder values.
 * @returns The populated string with all placeholders replaced.
 * @throws {Error} if any placeholder key is not found in the inputs.
 */
export declare function templateString(template: string, inputs: AgentInputs): string;
