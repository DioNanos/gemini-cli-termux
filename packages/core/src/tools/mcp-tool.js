/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { safeJsonStringify } from '../utils/safeJsonStringify.js';
import { BaseDeclarativeTool, BaseToolInvocation, Kind, ToolConfirmationOutcome, } from './tools.js';
import { ToolErrorType } from './tool-error.js';
export class DiscoveredMCPToolInvocation extends BaseToolInvocation {
    mcpTool;
    serverName;
    serverToolName;
    displayName;
    trust;
    cliConfig;
    static allowlist = new Set();
    constructor(mcpTool, serverName, serverToolName, displayName, messageBus, trust, params = {}, cliConfig) {
        // Use composite format for policy checks: serverName__toolName
        // This enables server wildcards (e.g., "google-workspace__*")
        // while still allowing specific tool rules
        super(params, messageBus, `${serverName}__${serverToolName}`, displayName, serverName);
        this.mcpTool = mcpTool;
        this.serverName = serverName;
        this.serverToolName = serverToolName;
        this.displayName = displayName;
        this.trust = trust;
        this.cliConfig = cliConfig;
    }
    getPolicyUpdateOptions(_outcome) {
        return { mcpName: this.serverName };
    }
    async getConfirmationDetails(_abortSignal) {
        const serverAllowListKey = this.serverName;
        const toolAllowListKey = `${this.serverName}.${this.serverToolName}`;
        if (this.cliConfig?.isTrustedFolder() && this.trust) {
            return false; // server is trusted, no confirmation needed
        }
        if (DiscoveredMCPToolInvocation.allowlist.has(serverAllowListKey) ||
            DiscoveredMCPToolInvocation.allowlist.has(toolAllowListKey)) {
            return false; // server and/or tool already allowlisted
        }
        const confirmationDetails = {
            type: 'mcp',
            title: 'Confirm MCP Tool Execution',
            serverName: this.serverName,
            toolName: this.serverToolName, // Display original tool name in confirmation
            toolDisplayName: this.displayName, // Display global registry name exposed to model and user
            onConfirm: async (outcome) => {
                if (outcome === ToolConfirmationOutcome.ProceedAlwaysServer) {
                    DiscoveredMCPToolInvocation.allowlist.add(serverAllowListKey);
                }
                else if (outcome === ToolConfirmationOutcome.ProceedAlwaysTool) {
                    DiscoveredMCPToolInvocation.allowlist.add(toolAllowListKey);
                }
                else if (outcome === ToolConfirmationOutcome.ProceedAlwaysAndSave) {
                    DiscoveredMCPToolInvocation.allowlist.add(toolAllowListKey);
                    await this.publishPolicyUpdate(outcome);
                }
            },
        };
        return confirmationDetails;
    }
    // Determine if the response contains tool errors
    // This is needed because CallToolResults should return errors inside the response.
    // ref: https://modelcontextprotocol.io/specification/2025-06-18/schema#calltoolresult
    isMCPToolError(rawResponseParts) {
        const functionResponse = rawResponseParts?.[0]?.functionResponse;
        const response = functionResponse?.response;
        if (response) {
            // Check for top-level isError (MCP Spec compliant)
            const isErrorTop = response.isError;
            if (isErrorTop === true || isErrorTop === 'true') {
                return true;
            }
            // Legacy check for nested error object (keep for backward compatibility if any tools rely on it)
            const error = response?.error;
            const isError = error?.isError;
            if (error && (isError === true || isError === 'true')) {
                return true;
            }
        }
        return false;
    }
    async execute(signal) {
        const functionCalls = [
            {
                name: this.serverToolName,
                args: this.params,
            },
        ];
        // Race MCP tool call with abort signal to respect cancellation
        const rawResponseParts = await new Promise((resolve, reject) => {
            if (signal.aborted) {
                const error = new Error('Tool call aborted');
                error.name = 'AbortError';
                reject(error);
                return;
            }
            const onAbort = () => {
                cleanup();
                const error = new Error('Tool call aborted');
                error.name = 'AbortError';
                reject(error);
            };
            const cleanup = () => {
                signal.removeEventListener('abort', onAbort);
            };
            signal.addEventListener('abort', onAbort, { once: true });
            this.mcpTool
                .callTool(functionCalls)
                .then((res) => {
                cleanup();
                resolve(res);
            })
                .catch((err) => {
                cleanup();
                reject(err);
            });
        });
        // Ensure the response is not an error
        if (this.isMCPToolError(rawResponseParts)) {
            const errorMessage = `MCP tool '${this.serverToolName}' reported tool error for function call: ${safeJsonStringify(functionCalls[0])} with response: ${safeJsonStringify(rawResponseParts)}`;
            return {
                llmContent: errorMessage,
                returnDisplay: `Error: MCP tool '${this.serverToolName}' reported an error.`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.MCP_TOOL_ERROR,
                },
            };
        }
        const transformedParts = transformMcpContentToParts(rawResponseParts);
        return {
            llmContent: transformedParts,
            returnDisplay: getStringifiedResultForDisplay(rawResponseParts),
        };
    }
    getDescription() {
        return safeJsonStringify(this.params);
    }
}
export class DiscoveredMCPTool extends BaseDeclarativeTool {
    mcpTool;
    serverName;
    serverToolName;
    parameterSchema;
    trust;
    cliConfig;
    extensionName;
    extensionId;
    constructor(mcpTool, serverName, serverToolName, description, parameterSchema, messageBus, trust, nameOverride, cliConfig, extensionName, extensionId) {
        super(nameOverride ?? generateValidName(serverToolName), `${serverToolName} (${serverName} MCP Server)`, description, Kind.Other, parameterSchema, messageBus, true, // isOutputMarkdown
        false, // canUpdateOutput,
        extensionName, extensionId);
        this.mcpTool = mcpTool;
        this.serverName = serverName;
        this.serverToolName = serverToolName;
        this.parameterSchema = parameterSchema;
        this.trust = trust;
        this.cliConfig = cliConfig;
        this.extensionName = extensionName;
        this.extensionId = extensionId;
    }
    getFullyQualifiedPrefix() {
        return `${this.serverName}__`;
    }
    asFullyQualifiedTool() {
        return new DiscoveredMCPTool(this.mcpTool, this.serverName, this.serverToolName, this.description, this.parameterSchema, this.messageBus, this.trust, `${this.getFullyQualifiedPrefix()}${this.serverToolName}`, this.cliConfig, this.extensionName, this.extensionId);
    }
    createInvocation(params, messageBus, _toolName, _displayName) {
        return new DiscoveredMCPToolInvocation(this.mcpTool, this.serverName, this.serverToolName, _displayName ?? this.displayName, messageBus, this.trust, params, this.cliConfig);
    }
}
function transformTextBlock(block) {
    return { text: block.text };
}
function transformImageAudioBlock(block, toolName) {
    return [
        {
            text: `[Tool '${toolName}' provided the following ${block.type} data with mime-type: ${block.mimeType}]`,
        },
        {
            inlineData: {
                mimeType: block.mimeType,
                data: block.data,
            },
        },
    ];
}
function transformResourceBlock(block, toolName) {
    const resource = block.resource;
    if (resource?.text) {
        return { text: resource.text };
    }
    if (resource?.blob) {
        const mimeType = resource.mimeType || 'application/octet-stream';
        return [
            {
                text: `[Tool '${toolName}' provided the following embedded resource with mime-type: ${mimeType}]`,
            },
            {
                inlineData: {
                    mimeType,
                    data: resource.blob,
                },
            },
        ];
    }
    return null;
}
function transformResourceLinkBlock(block) {
    return {
        text: `Resource Link: ${block.title || block.name} at ${block.uri}`,
    };
}
/**
 * Transforms the raw MCP content blocks from the SDK response into a
 * standard GenAI Part array.
 * @param sdkResponse The raw Part[] array from `mcpTool.callTool()`.
 * @returns A clean Part[] array ready for the scheduler.
 */
function transformMcpContentToParts(sdkResponse) {
    const funcResponse = sdkResponse?.[0]?.functionResponse;
    const mcpContent = funcResponse?.response?.['content'];
    const toolName = funcResponse?.name || 'unknown tool';
    if (!Array.isArray(mcpContent)) {
        return [{ text: '[Error: Could not parse tool response]' }];
    }
    const transformed = mcpContent.flatMap((block) => {
        switch (block.type) {
            case 'text':
                return transformTextBlock(block);
            case 'image':
            case 'audio':
                return transformImageAudioBlock(block, toolName);
            case 'resource':
                return transformResourceBlock(block, toolName);
            case 'resource_link':
                return transformResourceLinkBlock(block);
            default:
                return null;
        }
    });
    return transformed.filter((part) => part !== null);
}
/**
 * Processes the raw response from the MCP tool to generate a clean,
 * human-readable string for display in the CLI. It summarizes non-text
 * content and presents text directly.
 *
 * @param rawResponse The raw Part[] array from the GenAI SDK.
 * @returns A formatted string representing the tool's output.
 */
function getStringifiedResultForDisplay(rawResponse) {
    const mcpContent = rawResponse?.[0]?.functionResponse?.response?.['content'];
    if (!Array.isArray(mcpContent)) {
        return '```json\n' + JSON.stringify(rawResponse, null, 2) + '\n```';
    }
    const displayParts = mcpContent.map((block) => {
        switch (block.type) {
            case 'text':
                return block.text;
            case 'image':
                return `[Image: ${block.mimeType}]`;
            case 'audio':
                return `[Audio: ${block.mimeType}]`;
            case 'resource_link':
                return `[Link to ${block.title || block.name}: ${block.uri}]`;
            case 'resource':
                if (block.resource?.text) {
                    return block.resource.text;
                }
                return `[Embedded Resource: ${block.resource?.mimeType || 'unknown type'}]`;
            default:
                return `[Unknown content type: ${block.type}]`;
        }
    });
    return displayParts.join('\n');
}
/** Visible for testing */
export function generateValidName(name) {
    // Replace invalid characters (based on 400 error message from Gemini API) with underscores
    let validToolname = name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    // If longer than 63 characters, replace middle with '___'
    // (Gemini API says max length 64, but actual limit seems to be 63)
    if (validToolname.length > 63) {
        validToolname =
            validToolname.slice(0, 28) + '___' + validToolname.slice(-32);
    }
    return validToolname;
}
//# sourceMappingURL=mcp-tool.js.map