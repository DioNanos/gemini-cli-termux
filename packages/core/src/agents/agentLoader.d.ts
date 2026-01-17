/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AgentDefinition } from './types.js';
/**
 * DTO for Markdown parsing - represents the structure from frontmatter.
 */
interface FrontmatterBaseAgentDefinition {
    name: string;
    display_name?: string;
}
interface FrontmatterLocalAgentDefinition extends FrontmatterBaseAgentDefinition {
    kind: 'local';
    description: string;
    tools?: string[];
    system_prompt: string;
    model?: string;
    temperature?: number;
    max_turns?: number;
    timeout_mins?: number;
}
interface FrontmatterRemoteAgentDefinition extends FrontmatterBaseAgentDefinition {
    kind: 'remote';
    description?: string;
    agent_card_url: string;
}
type FrontmatterAgentDefinition = FrontmatterLocalAgentDefinition | FrontmatterRemoteAgentDefinition;
/**
 * Error thrown when an agent definition is invalid or cannot be loaded.
 */
export declare class AgentLoadError extends Error {
    filePath: string;
    constructor(filePath: string, message: string);
}
/**
 * Result of loading agents from a directory.
 */
export interface AgentLoadResult {
    agents: AgentDefinition[];
    errors: AgentLoadError[];
}
/**
 * Parses and validates an agent Markdown file with frontmatter.
 *
 * @param filePath Path to the Markdown file.
 * @returns An array containing the single parsed agent definition.
 * @throws AgentLoadError if parsing or validation fails.
 */
export declare function parseAgentMarkdown(filePath: string): Promise<FrontmatterAgentDefinition[]>;
/**
 * Converts a FrontmatterAgentDefinition DTO to the internal AgentDefinition structure.
 *
 * @param markdown The parsed Markdown/Frontmatter definition.
 * @returns The internal AgentDefinition.
 */
export declare function markdownToAgentDefinition(markdown: FrontmatterAgentDefinition): AgentDefinition;
/**
 * Loads all agents from a specific directory.
 * Ignores files starting with _ and non-supported extensions.
 * Supported extensions: .md
 *
 * @param dir Directory path to scan.
 * @returns Object containing successfully loaded agents and any errors.
 */
export declare function loadAgentsFromDirectory(dir: string): Promise<AgentLoadResult>;
export {};
