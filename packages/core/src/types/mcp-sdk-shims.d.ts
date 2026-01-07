/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

declare module '@modelcontextprotocol/sdk/client/index.js' {
  interface ClientOptions {
    name: string;
    version: string;
  }
  interface ClientInitOptions {
    jsonSchemaValidator?: import('@modelcontextprotocol/sdk/validation/types.js').jsonSchemaValidator;
  }
  interface ServerCapabilities {
    tools?: { listChanged?: boolean };
    resources?: { listChanged?: boolean };
    prompts?: { listChanged?: boolean };
  }
  export class Client {
    constructor(options: ClientOptions, init?: ClientInitOptions);
    onerror?: (error: unknown) => void;
    onclose?: () => void;
    setNotificationHandler(
      schema: unknown,
      handler: (notification: { params: unknown }) => void,
    ): void;
    setRequestHandler(
      schema: unknown,
      handler: (...args: unknown[]) => unknown,
    ): void;
    registerCapabilities(capabilities: Record<string, unknown>): void;
    notification(request: { method: string; params?: unknown }): Promise<void>;
    getServerCapabilities(): ServerCapabilities | undefined;
    getInstructions(): string | undefined;
    listTools(
      params?: Record<string, unknown>,
      options?: { timeout?: number; signal?: AbortSignal },
    ): Promise<{ tools: Array<import('@modelcontextprotocol/sdk/types.js').Tool> }>;
    listPrompts(
      params?: Record<string, unknown>,
      options?: { timeout?: number; signal?: AbortSignal },
    ): Promise<{
      prompts: Array<import('@modelcontextprotocol/sdk/types.js').Prompt>;
    }>;
    getPrompt(
      request: { name: string; arguments?: Record<string, unknown> },
      options?: { timeout?: number; signal?: AbortSignal },
    ): Promise<import('@modelcontextprotocol/sdk/types.js').GetPromptResult>;
    request<T = unknown>(
      request: unknown,
      schema?: unknown,
      options?: { timeout?: number },
    ): Promise<T>;
    callTool(
      request: unknown,
      schema?: unknown,
      options?: { timeout?: number },
    ): Promise<Record<string, unknown>>;
    connect(transport: unknown, options?: { timeout?: number }): Promise<void>;
    close(): Promise<void>;
    ping(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio.js' {
  export interface StdioClientTransportOptions {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    stderr?: 'pipe' | 'inherit' | 'ignore';
  }
  export class StdioClientTransport {
    stderr?: NodeJS.ReadableStream | null;
    constructor(options: StdioClientTransportOptions);
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/sse.js' {
  export interface SSEClientTransportOptions {
    url?: string;
    requestInit?: RequestInit;
    authProvider?: unknown;
  }
  export class SSEClientTransport {
    constructor(url: URL | string, options?: SSEClientTransportOptions);
    close(): Promise<void>;
  }
  export class SseError extends Error {
    code: number;
    constructor(code: number, message?: string);
  }
}

declare module '@modelcontextprotocol/sdk/client/streamableHttp.js' {
  export interface StreamableHTTPClientTransportOptions {
    url?: string;
    requestInit?: RequestInit;
    authProvider?: unknown;
    fetch?: (url: string | URL, init?: RequestInit) => Promise<Response>;
  }
  export class StreamableHTTPClientTransport {
    _requestInit?: RequestInit;
    constructor(
      url: URL | string,
      options?: StreamableHTTPClientTransportOptions,
    );
    close(): Promise<void>;
  }
  export class StreamableHTTPError extends Error {
    code: number;
    constructor(code: number, message?: string);
  }
}

declare module '@modelcontextprotocol/sdk/client/auth.js' {
  import type {
    OAuthClientInformation,
    OAuthClientInformationFull,
    OAuthClientMetadata,
    OAuthTokens,
  } from '@modelcontextprotocol/sdk/shared/auth.js';
  export interface OAuthClientProvider {
    redirectUrl: string;
    clientMetadata: OAuthClientMetadata;
    clientInformation(): OAuthClientInformation | undefined;
    saveClientInformation(info: OAuthClientInformationFull): void;
    tokens(): Promise<OAuthTokens | undefined>;
  }
}

declare module '@modelcontextprotocol/sdk/shared/auth.js' {
  export interface OAuthTokens {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    token_type?: string;
    expires_in?: number;
  }
  export interface OAuthClientInformation {
    client_id?: string;
    client_secret?: string;
  }
  export interface OAuthClientInformationFull extends OAuthClientInformation {
    [key: string]: unknown;
  }
  export interface OAuthClientMetadata {
    client_name?: string;
    redirect_uris?: string[];
    grant_types?: string[];
    response_types?: string[];
    token_endpoint_auth_method?: string;
    [key: string]: unknown;
  }
}

declare module '@modelcontextprotocol/sdk/shared/transport.js' {
  export interface Transport {
    close(): Promise<void>;
    stderr?: NodeJS.ReadableStream | null;
  }
}

declare module '@modelcontextprotocol/sdk/validation/types.js' {
  export type JsonSchemaType = Record<string, unknown>;
  export type JsonSchemaValidator<T> = (input: unknown) => {
    valid: boolean;
    data?: T;
    errorMessage?: string;
  };
  export interface jsonSchemaValidator {
    getValidator<T>(schema: JsonSchemaType): JsonSchemaValidator<T>;
  }
}

declare module '@modelcontextprotocol/sdk/validation/ajv' {
  import type {
    JsonSchemaType,
    JsonSchemaValidator,
  } from '@modelcontextprotocol/sdk/validation/types.js';
  export class AjvJsonSchemaValidator {
    getValidator<T>(schema: JsonSchemaType): JsonSchemaValidator<T>;
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  type JsonSchemaType = Record<string, unknown>;
  export interface PromptArgument {
    name: string;
    description?: string;
    required?: boolean;
  }
  export interface Resource {
    uri: string;
    name?: string;
    description?: string;
    mimeType?: string;
  }
  export interface Prompt {
    name: string;
    description?: string;
    arguments?: PromptArgument[];
  }
  export interface GetPromptResult {
    error?: string;
    messages?: Array<{
      role?: string;
      content?: {
        type?: string;
        text?: string;
      };
    }>;
  }
  export interface ReadResourceResult {
    contents?: Array<{
      uri?: string;
      mimeType?: string;
      text?: string;
      blob?: string;
    }>;
  }
  export interface Tool {
    name: string;
    description?: string;
    inputSchema?: JsonSchemaType;
  }
  export const CallToolResultSchema: unknown;
  export const ListToolsResultSchema: unknown;
  export const ListResourcesResultSchema: unknown;
  export const ListRootsRequestSchema: unknown;
  export const ReadResourceResultSchema: unknown;
  export const ResourceListChangedNotificationSchema: unknown;
  export const ToolListChangedNotificationSchema: unknown;
}
