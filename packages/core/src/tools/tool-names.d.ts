/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const GLOB_TOOL_NAME = "glob";
export declare const WRITE_TODOS_TOOL_NAME = "write_todos";
export declare const WRITE_FILE_TOOL_NAME = "write_file";
export declare const WEB_SEARCH_TOOL_NAME = "google_web_search";
export declare const WEB_FETCH_TOOL_NAME = "web_fetch";
export declare const EDIT_TOOL_NAME = "replace";
export declare const SHELL_TOOL_NAME = "run_shell_command";
export declare const GREP_TOOL_NAME = "search_file_content";
export declare const READ_MANY_FILES_TOOL_NAME = "read_many_files";
export declare const READ_FILE_TOOL_NAME = "read_file";
export declare const LS_TOOL_NAME = "list_directory";
export declare const MEMORY_TOOL_NAME = "save_memory";
export declare const GET_INTERNAL_DOCS_TOOL_NAME = "get_internal_docs";
export declare const ACTIVATE_SKILL_TOOL_NAME = "activate_skill";
export declare const EDIT_TOOL_NAMES: Set<string>;
export declare const DELEGATE_TO_AGENT_TOOL_NAME = "delegate_to_agent";
/** Prefix used for tools discovered via the toolDiscoveryCommand. */
export declare const DISCOVERED_TOOL_PREFIX = "discovered_tool_";
/**
 * List of all built-in tool names.
 */
export declare const ALL_BUILTIN_TOOL_NAMES: readonly ["glob", "write_todos", "write_file", "google_web_search", "web_fetch", "replace", "run_shell_command", "search_file_content", "read_many_files", "read_file", "list_directory", "save_memory", "activate_skill", "delegate_to_agent"];
/**
 * Validates if a tool name is syntactically valid.
 * Checks against built-in tools, discovered tools, and MCP naming conventions.
 */
export declare function isValidToolName(name: string, options?: {
    allowWildcards?: boolean;
}): boolean;
