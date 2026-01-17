/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Defines valid event metadata keys for Clearcut logging.
export var EventMetadataKey;
(function (EventMetadataKey) {
    // Deleted enums: 24
    // Next ID: 137
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_KEY_UNKNOWN"] = 0] = "GEMINI_CLI_KEY_UNKNOWN";
    // ==========================================================================
    // Start Session Event Keys
    // ===========================================================================
    // Logs the model id used in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_MODEL"] = 1] = "GEMINI_CLI_START_SESSION_MODEL";
    // Logs the embedding model id used in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_EMBEDDING_MODEL"] = 2] = "GEMINI_CLI_START_SESSION_EMBEDDING_MODEL";
    // Logs the sandbox that was used in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_SANDBOX"] = 3] = "GEMINI_CLI_START_SESSION_SANDBOX";
    // Logs the core tools that were enabled in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_CORE_TOOLS"] = 4] = "GEMINI_CLI_START_SESSION_CORE_TOOLS";
    // Logs the approval mode that was used in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_APPROVAL_MODE"] = 5] = "GEMINI_CLI_START_SESSION_APPROVAL_MODE";
    // Logs whether an API key was used in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_API_KEY_ENABLED"] = 6] = "GEMINI_CLI_START_SESSION_API_KEY_ENABLED";
    // Logs whether the Vertex API was used in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_VERTEX_API_ENABLED"] = 7] = "GEMINI_CLI_START_SESSION_VERTEX_API_ENABLED";
    // Logs whether debug mode was enabled in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_DEBUG_MODE_ENABLED"] = 8] = "GEMINI_CLI_START_SESSION_DEBUG_MODE_ENABLED";
    // Logs the MCP servers that were enabled in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_MCP_SERVERS"] = 9] = "GEMINI_CLI_START_SESSION_MCP_SERVERS";
    // Logs whether user-collected telemetry was enabled in the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_TELEMETRY_ENABLED"] = 10] = "GEMINI_CLI_START_SESSION_TELEMETRY_ENABLED";
    // Logs whether prompt collection was enabled for user-collected telemetry.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_TELEMETRY_LOG_USER_PROMPTS_ENABLED"] = 11] = "GEMINI_CLI_START_SESSION_TELEMETRY_LOG_USER_PROMPTS_ENABLED";
    // Logs whether the session was configured to respect gitignore files.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_RESPECT_GITIGNORE"] = 12] = "GEMINI_CLI_START_SESSION_RESPECT_GITIGNORE";
    // Logs the output format of the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_OUTPUT_FORMAT"] = 94] = "GEMINI_CLI_START_SESSION_OUTPUT_FORMAT";
    // ==========================================================================
    // User Prompt Event Keys
    // ===========================================================================
    // Logs the length of the prompt.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_USER_PROMPT_LENGTH"] = 13] = "GEMINI_CLI_USER_PROMPT_LENGTH";
    // ==========================================================================
    // Tool Call Event Keys
    // ===========================================================================
    // Logs the function name.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_NAME"] = 14] = "GEMINI_CLI_TOOL_CALL_NAME";
    // Logs the MCP server name.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_MCP_SERVER_NAME"] = 95] = "GEMINI_CLI_TOOL_CALL_MCP_SERVER_NAME";
    // Logs the user's decision about how to handle the tool call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_DECISION"] = 15] = "GEMINI_CLI_TOOL_CALL_DECISION";
    // Logs whether the tool call succeeded.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_SUCCESS"] = 16] = "GEMINI_CLI_TOOL_CALL_SUCCESS";
    // Logs the tool call duration in milliseconds.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_DURATION_MS"] = 17] = "GEMINI_CLI_TOOL_CALL_DURATION_MS";
    // Do not use.
    EventMetadataKey[EventMetadataKey["DEPRECATED_GEMINI_CLI_TOOL_ERROR_MESSAGE"] = 18] = "DEPRECATED_GEMINI_CLI_TOOL_ERROR_MESSAGE";
    // Logs the tool call error type, if any.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_ERROR_TYPE"] = 19] = "GEMINI_CLI_TOOL_CALL_ERROR_TYPE";
    // Logs the length of tool output
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_CALL_CONTENT_LENGTH"] = 93] = "GEMINI_CLI_TOOL_CALL_CONTENT_LENGTH";
    // ==========================================================================
    // Replace Tool Call Event Keys
    // ===========================================================================
    // Logs a edit tool strategy choice.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EDIT_STRATEGY"] = 109] = "GEMINI_CLI_EDIT_STRATEGY";
    // Logs a edit correction event.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EDIT_CORRECTION"] = 110] = "GEMINI_CLI_EDIT_CORRECTION";
    // Logs the reason for web fetch fallback.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_WEB_FETCH_FALLBACK_REASON"] = 116] = "GEMINI_CLI_WEB_FETCH_FALLBACK_REASON";
    // ==========================================================================
    // GenAI API Request Event Keys
    // ===========================================================================
    // Logs the model id of the request.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_REQUEST_MODEL"] = 20] = "GEMINI_CLI_API_REQUEST_MODEL";
    // ==========================================================================
    // GenAI API Response Event Keys
    // ===========================================================================
    // Logs the model id of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_MODEL"] = 21] = "GEMINI_CLI_API_RESPONSE_MODEL";
    // Logs the status code of the response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_STATUS_CODE"] = 22] = "GEMINI_CLI_API_RESPONSE_STATUS_CODE";
    // Logs the duration of the API call in milliseconds.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_DURATION_MS"] = 23] = "GEMINI_CLI_API_RESPONSE_DURATION_MS";
    // Logs the input token count of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_INPUT_TOKEN_COUNT"] = 25] = "GEMINI_CLI_API_RESPONSE_INPUT_TOKEN_COUNT";
    // Logs the output token count of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_OUTPUT_TOKEN_COUNT"] = 26] = "GEMINI_CLI_API_RESPONSE_OUTPUT_TOKEN_COUNT";
    // Logs the cached token count of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_CACHED_TOKEN_COUNT"] = 27] = "GEMINI_CLI_API_RESPONSE_CACHED_TOKEN_COUNT";
    // Logs the thinking token count of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_THINKING_TOKEN_COUNT"] = 28] = "GEMINI_CLI_API_RESPONSE_THINKING_TOKEN_COUNT";
    // Logs the tool use token count of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_RESPONSE_TOOL_TOKEN_COUNT"] = 29] = "GEMINI_CLI_API_RESPONSE_TOOL_TOKEN_COUNT";
    // ==========================================================================
    // GenAI API Error Event Keys
    // ===========================================================================
    // Logs the model id of the API call.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_ERROR_MODEL"] = 30] = "GEMINI_CLI_API_ERROR_MODEL";
    // Logs the error type.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_ERROR_TYPE"] = 31] = "GEMINI_CLI_API_ERROR_TYPE";
    // Logs the status code of the error response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_ERROR_STATUS_CODE"] = 32] = "GEMINI_CLI_API_ERROR_STATUS_CODE";
    // Logs the duration of the API call in milliseconds.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_API_ERROR_DURATION_MS"] = 33] = "GEMINI_CLI_API_ERROR_DURATION_MS";
    // ==========================================================================
    // End Session Event Keys
    // ===========================================================================
    // Logs the end of a session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_END_SESSION_ID"] = 34] = "GEMINI_CLI_END_SESSION_ID";
    // ==========================================================================
    // Shared Keys
    // ===========================================================================
    // Logs the Prompt Id
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_PROMPT_ID"] = 35] = "GEMINI_CLI_PROMPT_ID";
    // Logs the Auth type for the prompt, api responses and errors.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AUTH_TYPE"] = 36] = "GEMINI_CLI_AUTH_TYPE";
    // Logs the total number of Google accounts ever used.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_GOOGLE_ACCOUNTS_COUNT"] = 37] = "GEMINI_CLI_GOOGLE_ACCOUNTS_COUNT";
    // Logs the Surface from where the Gemini CLI was invoked, eg: VSCode.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_SURFACE"] = 39] = "GEMINI_CLI_SURFACE";
    // Logs the session id
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_SESSION_ID"] = 40] = "GEMINI_CLI_SESSION_ID";
    // Logs the Gemini CLI version
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_VERSION"] = 54] = "GEMINI_CLI_VERSION";
    // Logs the Gemini CLI Git commit hash
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_GIT_COMMIT_HASH"] = 55] = "GEMINI_CLI_GIT_COMMIT_HASH";
    // Logs the Gemini CLI OS
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_OS"] = 82] = "GEMINI_CLI_OS";
    // Logs active user settings
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_USER_SETTINGS"] = 84] = "GEMINI_CLI_USER_SETTINGS";
    // Logs the name of the GitHub Action workflow that triggered the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_GH_WORKFLOW_NAME"] = 130] = "GEMINI_CLI_GH_WORKFLOW_NAME";
    // Logs the active experiment IDs for the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXPERIMENT_IDS"] = 131] = "GEMINI_CLI_EXPERIMENT_IDS";
    // Logs the repository name of the GitHub Action that triggered the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_GH_REPOSITORY_NAME_HASH"] = 132] = "GEMINI_CLI_GH_REPOSITORY_NAME_HASH";
    // ==========================================================================
    // Loop Detected Event Keys
    // ===========================================================================
    // Logs the type of loop detected.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_LOOP_DETECTED_TYPE"] = 38] = "GEMINI_CLI_LOOP_DETECTED_TYPE";
    // ==========================================================================
    // Slash Command Event Keys
    // ===========================================================================
    // Logs the name of the slash command.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_SLASH_COMMAND_NAME"] = 41] = "GEMINI_CLI_SLASH_COMMAND_NAME";
    // Logs the subcommand of the slash command.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_SLASH_COMMAND_SUBCOMMAND"] = 42] = "GEMINI_CLI_SLASH_COMMAND_SUBCOMMAND";
    // Logs the status of the slash command (e.g. 'success', 'error')
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_SLASH_COMMAND_STATUS"] = 51] = "GEMINI_CLI_SLASH_COMMAND_STATUS";
    // ==========================================================================
    // Next Speaker Check Event Keys
    // ===========================================================================
    // Logs the finish reason of the previous streamGenerateContent response
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESPONSE_FINISH_REASON"] = 43] = "GEMINI_CLI_RESPONSE_FINISH_REASON";
    // Logs the result of the next speaker check
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_NEXT_SPEAKER_CHECK_RESULT"] = 44] = "GEMINI_CLI_NEXT_SPEAKER_CHECK_RESULT";
    // ==========================================================================
    // Malformed JSON Response Event Keys
    // ==========================================================================
    // Logs the model that produced the malformed JSON response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_MALFORMED_JSON_RESPONSE_MODEL"] = 45] = "GEMINI_CLI_MALFORMED_JSON_RESPONSE_MODEL";
    // ==========================================================================
    // IDE Connection Event Keys
    // ===========================================================================
    // Logs the type of the IDE connection.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_IDE_CONNECTION_TYPE"] = 46] = "GEMINI_CLI_IDE_CONNECTION_TYPE";
    // Logs AI added lines in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AI_ADDED_LINES"] = 47] = "GEMINI_CLI_AI_ADDED_LINES";
    // Logs AI removed lines in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AI_REMOVED_LINES"] = 48] = "GEMINI_CLI_AI_REMOVED_LINES";
    // Logs user added lines in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_USER_ADDED_LINES"] = 49] = "GEMINI_CLI_USER_ADDED_LINES";
    // Logs user removed lines in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_USER_REMOVED_LINES"] = 50] = "GEMINI_CLI_USER_REMOVED_LINES";
    // Logs AI added characters in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AI_ADDED_CHARS"] = 103] = "GEMINI_CLI_AI_ADDED_CHARS";
    // Logs AI removed characters in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AI_REMOVED_CHARS"] = 104] = "GEMINI_CLI_AI_REMOVED_CHARS";
    // Logs user added characters in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_USER_ADDED_CHARS"] = 105] = "GEMINI_CLI_USER_ADDED_CHARS";
    // Logs user removed characters in edit/write tool response.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_USER_REMOVED_CHARS"] = 106] = "GEMINI_CLI_USER_REMOVED_CHARS";
    // ==========================================================================
    // Kitty Sequence Overflow Event Keys
    // ===========================================================================
    // Do not use.
    EventMetadataKey[EventMetadataKey["DEPRECATED_GEMINI_CLI_KITTY_TRUNCATED_SEQUENCE"] = 52] = "DEPRECATED_GEMINI_CLI_KITTY_TRUNCATED_SEQUENCE";
    // Logs the length of the kitty sequence that overflowed.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_KITTY_SEQUENCE_LENGTH"] = 53] = "GEMINI_CLI_KITTY_SEQUENCE_LENGTH";
    // ==========================================================================
    // Conversation Finished Event Keys
    // ===========================================================================
    // Logs the approval mode of the session.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_APPROVAL_MODE"] = 58] = "GEMINI_CLI_APPROVAL_MODE";
    // Logs the number of turns
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONVERSATION_TURN_COUNT"] = 59] = "GEMINI_CLI_CONVERSATION_TURN_COUNT";
    // Logs the number of tokens before context window compression.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_COMPRESSION_TOKENS_BEFORE"] = 60] = "GEMINI_CLI_COMPRESSION_TOKENS_BEFORE";
    // Logs the number of tokens after context window compression.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_COMPRESSION_TOKENS_AFTER"] = 61] = "GEMINI_CLI_COMPRESSION_TOKENS_AFTER";
    // Logs tool type whether it is mcp or native.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_TYPE"] = 62] = "GEMINI_CLI_TOOL_TYPE";
    // Logs count of MCP servers in Start Session Event
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_MCP_SERVERS_COUNT"] = 63] = "GEMINI_CLI_START_SESSION_MCP_SERVERS_COUNT";
    // Logs count of MCP tools in Start Session Event
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_MCP_TOOLS_COUNT"] = 64] = "GEMINI_CLI_START_SESSION_MCP_TOOLS_COUNT";
    // Logs name of MCP tools as comma separated string
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_MCP_TOOLS"] = 65] = "GEMINI_CLI_START_SESSION_MCP_TOOLS";
    // ==========================================================================
    // Research Event Keys
    // ===========================================================================
    // Logs the research opt-in status (true/false)
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESEARCH_OPT_IN_STATUS"] = 66] = "GEMINI_CLI_RESEARCH_OPT_IN_STATUS";
    // Logs the contact email for research participation
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESEARCH_CONTACT_EMAIL"] = 67] = "GEMINI_CLI_RESEARCH_CONTACT_EMAIL";
    // Logs the user ID for research events
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESEARCH_USER_ID"] = 68] = "GEMINI_CLI_RESEARCH_USER_ID";
    // Logs the type of research feedback
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESEARCH_FEEDBACK_TYPE"] = 69] = "GEMINI_CLI_RESEARCH_FEEDBACK_TYPE";
    // Logs the content of research feedback
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESEARCH_FEEDBACK_CONTENT"] = 70] = "GEMINI_CLI_RESEARCH_FEEDBACK_CONTENT";
    // Logs survey responses for research feedback (JSON stringified)
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RESEARCH_SURVEY_RESPONSES"] = 71] = "GEMINI_CLI_RESEARCH_SURVEY_RESPONSES";
    // ==========================================================================
    // File Operation Event Keys
    // ===========================================================================
    // Logs the programming language of the project.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_PROGRAMMING_LANGUAGE"] = 56] = "GEMINI_CLI_PROGRAMMING_LANGUAGE";
    // Logs the operation type of the file operation.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_FILE_OPERATION_TYPE"] = 57] = "GEMINI_CLI_FILE_OPERATION_TYPE";
    // Logs the number of lines in the file operation.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_FILE_OPERATION_LINES"] = 72] = "GEMINI_CLI_FILE_OPERATION_LINES";
    // Logs the mimetype of the file in the file operation.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_FILE_OPERATION_MIMETYPE"] = 73] = "GEMINI_CLI_FILE_OPERATION_MIMETYPE";
    // Logs the extension of the file in the file operation.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_FILE_OPERATION_EXTENSION"] = 74] = "GEMINI_CLI_FILE_OPERATION_EXTENSION";
    // ==========================================================================
    // Content Streaming Event Keys
    // ===========================================================================
    // Logs the error message for an invalid chunk.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_INVALID_CHUNK_ERROR_MESSAGE"] = 75] = "GEMINI_CLI_INVALID_CHUNK_ERROR_MESSAGE";
    // Logs the attempt number for a content retry.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONTENT_RETRY_ATTEMPT_NUMBER"] = 76] = "GEMINI_CLI_CONTENT_RETRY_ATTEMPT_NUMBER";
    // Logs the error type for a content retry.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONTENT_RETRY_ERROR_TYPE"] = 77] = "GEMINI_CLI_CONTENT_RETRY_ERROR_TYPE";
    // Logs the delay in milliseconds for a content retry.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONTENT_RETRY_DELAY_MS"] = 78] = "GEMINI_CLI_CONTENT_RETRY_DELAY_MS";
    // Logs the total number of attempts for a content retry failure.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONTENT_RETRY_FAILURE_TOTAL_ATTEMPTS"] = 79] = "GEMINI_CLI_CONTENT_RETRY_FAILURE_TOTAL_ATTEMPTS";
    // Logs the final error type for a content retry failure.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONTENT_RETRY_FAILURE_FINAL_ERROR_TYPE"] = 80] = "GEMINI_CLI_CONTENT_RETRY_FAILURE_FINAL_ERROR_TYPE";
    // Logs the total duration in milliseconds for a content retry failure.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CONTENT_RETRY_FAILURE_TOTAL_DURATION_MS"] = 81] = "GEMINI_CLI_CONTENT_RETRY_FAILURE_TOTAL_DURATION_MS";
    // Logs the current nodejs version
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_NODE_VERSION"] = 83] = "GEMINI_CLI_NODE_VERSION";
    // ==========================================================================
    // Extension Event Keys
    // ===========================================================================
    // Logs the name of the extension.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_NAME"] = 85] = "GEMINI_CLI_EXTENSION_NAME";
    // Logs the name of the extension.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_ID"] = 121] = "GEMINI_CLI_EXTENSION_ID";
    // Logs the version of the extension.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_VERSION"] = 86] = "GEMINI_CLI_EXTENSION_VERSION";
    // Logs the previous version of the extension.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_PREVIOUS_VERSION"] = 117] = "GEMINI_CLI_EXTENSION_PREVIOUS_VERSION";
    // Logs the source of the extension.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_SOURCE"] = 87] = "GEMINI_CLI_EXTENSION_SOURCE";
    // Logs the status of the extension install.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_INSTALL_STATUS"] = 88] = "GEMINI_CLI_EXTENSION_INSTALL_STATUS";
    // Logs the status of the extension uninstall
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_UNINSTALL_STATUS"] = 96] = "GEMINI_CLI_EXTENSION_UNINSTALL_STATUS";
    // Logs the status of the extension uninstall
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_UPDATE_STATUS"] = 118] = "GEMINI_CLI_EXTENSION_UPDATE_STATUS";
    // Logs the count of extensions in Start Session Event
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_EXTENSIONS_COUNT"] = 119] = "GEMINI_CLI_START_SESSION_EXTENSIONS_COUNT";
    // Logs the name of extensions as a comma-separated string
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_START_SESSION_EXTENSION_IDS"] = 120] = "GEMINI_CLI_START_SESSION_EXTENSION_IDS";
    // Logs the setting scope for an extension enablement.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_ENABLE_SETTING_SCOPE"] = 102] = "GEMINI_CLI_EXTENSION_ENABLE_SETTING_SCOPE";
    // Logs the setting scope for an extension disablement.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_EXTENSION_DISABLE_SETTING_SCOPE"] = 107] = "GEMINI_CLI_EXTENSION_DISABLE_SETTING_SCOPE";
    // ==========================================================================
    // Tool Output Truncated Event Keys
    // ===========================================================================
    // Logs the original length of the tool output.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_ORIGINAL_LENGTH"] = 89] = "GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_ORIGINAL_LENGTH";
    // Logs the truncated length of the tool output.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_TRUNCATED_LENGTH"] = 90] = "GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_TRUNCATED_LENGTH";
    // Logs the threshold at which the tool output was truncated.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_THRESHOLD"] = 91] = "GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_THRESHOLD";
    // Logs the number of lines the tool output was truncated to.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_LINES"] = 92] = "GEMINI_CLI_TOOL_OUTPUT_TRUNCATED_LINES";
    // ==========================================================================
    // Model Router Event Keys
    // ==========================================================================
    // Logs the outcome of a model routing decision (e.g., which route/model was
    // selected).
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_ROUTING_DECISION"] = 97] = "GEMINI_CLI_ROUTING_DECISION";
    // Logs an event when the model router fails to make a decision or the chosen
    // route fails.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_ROUTING_FAILURE"] = 98] = "GEMINI_CLI_ROUTING_FAILURE";
    // Logs the latency in milliseconds for the router to make a decision.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_ROUTING_LATENCY_MS"] = 99] = "GEMINI_CLI_ROUTING_LATENCY_MS";
    // Logs a specific reason for a routing failure.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_ROUTING_FAILURE_REASON"] = 100] = "GEMINI_CLI_ROUTING_FAILURE_REASON";
    // Logs the source of the decision.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_ROUTING_DECISION_SOURCE"] = 101] = "GEMINI_CLI_ROUTING_DECISION_SOURCE";
    // Logs an event when the user uses the /model command.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_MODEL_SLASH_COMMAND"] = 108] = "GEMINI_CLI_MODEL_SLASH_COMMAND";
    // ==========================================================================
    // Agent Event Keys
    // ==========================================================================
    // Logs the name of the agent.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_NAME"] = 111] = "GEMINI_CLI_AGENT_NAME";
    // Logs the unique ID of the agent instance.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_ID"] = 112] = "GEMINI_CLI_AGENT_ID";
    // Logs the duration of the agent execution in milliseconds.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_DURATION_MS"] = 113] = "GEMINI_CLI_AGENT_DURATION_MS";
    // Logs the number of turns the agent took.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_TURN_COUNT"] = 114] = "GEMINI_CLI_AGENT_TURN_COUNT";
    // Logs the reason for agent termination.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_TERMINATE_REASON"] = 115] = "GEMINI_CLI_AGENT_TERMINATE_REASON";
    // Logs the reason for an agent recovery attempt.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_RECOVERY_REASON"] = 122] = "GEMINI_CLI_AGENT_RECOVERY_REASON";
    // Logs the duration of an agent recovery attempt in milliseconds.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_RECOVERY_DURATION_MS"] = 123] = "GEMINI_CLI_AGENT_RECOVERY_DURATION_MS";
    // Logs whether the agent recovery attempt was successful.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_AGENT_RECOVERY_SUCCESS"] = 124] = "GEMINI_CLI_AGENT_RECOVERY_SUCCESS";
    // Logs whether the session is interactive.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_INTERACTIVE"] = 125] = "GEMINI_CLI_INTERACTIVE";
    // ==========================================================================
    // LLM Loop Check Event Keys
    // ==========================================================================
    // Logs the confidence score from the flash model loop check.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_LLM_LOOP_CHECK_FLASH_CONFIDENCE"] = 126] = "GEMINI_CLI_LLM_LOOP_CHECK_FLASH_CONFIDENCE";
    // Logs the name of the main model used for the secondary loop check.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_LLM_LOOP_CHECK_MAIN_MODEL"] = 127] = "GEMINI_CLI_LLM_LOOP_CHECK_MAIN_MODEL";
    // Logs the confidence score from the main model loop check.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_LLM_LOOP_CHECK_MAIN_MODEL_CONFIDENCE"] = 128] = "GEMINI_CLI_LLM_LOOP_CHECK_MAIN_MODEL_CONFIDENCE";
    // Logs the model that confirmed the loop.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_LOOP_DETECTED_CONFIRMED_BY_MODEL"] = 129] = "GEMINI_CLI_LOOP_DETECTED_CONFIRMED_BY_MODEL";
    // ==========================================================================
    // Hook Call Event Keys
    // ==========================================================================
    // Logs the name of the hook event (e.g., 'BeforeTool', 'AfterModel').
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_HOOK_EVENT_NAME"] = 133] = "GEMINI_CLI_HOOK_EVENT_NAME";
    // Logs the duration of the hook execution in milliseconds.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_HOOK_DURATION_MS"] = 134] = "GEMINI_CLI_HOOK_DURATION_MS";
    // Logs whether the hook execution was successful.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_HOOK_SUCCESS"] = 135] = "GEMINI_CLI_HOOK_SUCCESS";
    // Logs the exit code of the hook script (if applicable).
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_HOOK_EXIT_CODE"] = 136] = "GEMINI_CLI_HOOK_EXIT_CODE";
    // Logs CPU information of user machine.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CPU_INFO"] = 137] = "GEMINI_CLI_CPU_INFO";
    // Logs number of CPU cores of user machine.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_CPU_CORES"] = 138] = "GEMINI_CLI_CPU_CORES";
    // Logs GPU information of user machine.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_GPU_INFO"] = 139] = "GEMINI_CLI_GPU_INFO";
    // Logs total RAM in GB of user machine.
    EventMetadataKey[EventMetadataKey["GEMINI_CLI_RAM_TOTAL_GB"] = 140] = "GEMINI_CLI_RAM_TOTAL_GB";
})(EventMetadataKey || (EventMetadataKey = {}));
//# sourceMappingURL=event-metadata-key.js.map