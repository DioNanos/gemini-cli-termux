/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolInvocation,
  type ToolResult,
} from './tools.js';
import type { FunctionDeclaration } from '@google/genai';
import type { Config } from '../config/config.js';
import {
  appendContextMemoryEntry,
  type ContextMemoryScope,
} from '../utils/contextMemory.js';
import { ToolErrorType } from './tool-error.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';

interface McpImportParams {
  categories?: string[];
  scope?: string;
  target?: 'base' | 'user';
  entries?: Array<{
    key?: string;
    text?: string;
    scope?: string;
    tags?: string[];
    expiresAt?: string;
    sensitivity?: 'low' | 'medium' | 'high';
    source?: string;
    confidence?: number;
  }>;
  payload?: Record<string, unknown>;
}

const schema: FunctionDeclaration = {
  name: 'mcp_import_memory',
  description:
    'Import MCP memory data into local context memory. Intended to be called after reading categories via MCP (e.g., memory_read). Writes to base.json by default (requires allowBaseWrite=true).',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      categories: { type: 'array', items: { type: 'string' } },
      scope: { type: 'string' },
      target: { type: 'string', enum: ['base', 'user'] },
      entries: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            text: { type: 'string' },
            scope: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            expiresAt: { type: 'string' },
            sensitivity: { type: 'string', enum: ['low', 'medium', 'high'] },
            source: { type: 'string' },
            confidence: { type: 'number' },
          },
        },
      },
      payload: { type: 'object' },
    },
  },
};

function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  out: Array<{ key: string; text: string }> = [],
) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v === null || v === undefined) continue;
    if (typeof v === 'object' && !Array.isArray(v)) {
      flattenObject(v as Record<string, unknown>, key, out);
    } else if (Array.isArray(v)) {
      const text =
        v.length <= 10
          ? v.join(', ')
          : `${v.slice(0, 5).join(', ')} ... (+${v.length - 5})`;
      out.push({ key, text });
    } else {
      out.push({ key, text: String(v) });
    }
  }
  return out;
}

class McpImportInvocation extends BaseToolInvocation<
  McpImportParams,
  ToolResult
> {
  constructor(
    private readonly config: Config,
    params: McpImportParams,
    messageBus: MessageBus,
    toolName?: string,
    displayName?: string,
  ) {
    super(params, messageBus, toolName, displayName);
  }

  getDescription(): string {
    return 'Imports MCP memory data or payload into local context memory (base or user).';
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const options = this.config.getContextMemoryOptions();
    if (!options?.mcpImport?.enabled) {
      return {
        llmContent:
          'MCP import is disabled in settings (contextMemory.mcpImport.enabled=false).',
        returnDisplay: 'MCP import is disabled in settings.',
        error: {
          message: 'MCP import disabled',
          type: ToolErrorType.INVALID_TOOL_PARAMS,
        },
      };
    }
    const target = this.params.target ?? 'base';
    if (target === 'base' && !options.allowBaseWrite) {
      return {
        llmContent:
          'Base memory is read-only. Enable Allow Base Memory Writes to import into base.json.',
        returnDisplay:
          'Base memory is read-only. Enable the setting to proceed.',
        error: {
          message: 'Base write not allowed',
          type: ToolErrorType.PERMISSION_DENIED,
        },
      };
    }

    const scope =
      (this.params.scope as ContextMemoryScope | undefined) ||
      (options.mcpImport.scope as ContextMemoryScope) ||
      'global';

    let entries =
      this.params.entries?.map((e) => ({ ...e })) ??
      ([] as McpImportParams['entries']);

    if (this.params.payload && (!entries || entries.length === 0)) {
      const flat = flattenObject(this.params.payload);
      entries = flat.map(({ key, text }) => ({ key: `mcp.${key}`, text }));
    }

    if (!entries || entries.length === 0) {
      return {
        llmContent: 'No entries or payload provided to import.',
        returnDisplay: 'No entries to import.',
        error: {
          message: 'Empty import payload',
          type: ToolErrorType.INVALID_TOOL_PARAMS,
        },
      };
    }

    const written: string[] = [];
    for (const entry of entries) {
      if (!entry?.text) continue;
      await appendContextMemoryEntry(entry.text, target, scope, options, {
        key: entry.key,
        tags: entry.tags,
        expiresAt: entry.expiresAt,
        sensitivity: entry.sensitivity,
        source: entry.source ?? 'mcp-import',
        confidence: entry.confidence,
        scope,
      });
      written.push(entry.key ?? entry.text.slice(0, 30));
    }

    return {
      llmContent: `Imported ${written.length} entries into ${target}. First keys: ${written
        .slice(0, 5)
        .join(', ')}`,
      returnDisplay: `Imported ${written.length} entries into ${target}.`,
    };
  }
}

export class McpImportTool extends BaseDeclarativeTool<
  McpImportParams,
  ToolResult
> {
  static readonly Name = 'mcp_import_memory';

  constructor(
    private readonly config: Config,
    messageBus: MessageBus,
  ) {
    super(
      McpImportTool.Name,
      'ImportMemory',
      schema.description!,
      Kind.Other,
      schema.parametersJsonSchema as Record<string, unknown>,
      messageBus,
    );
  }

  protected createInvocation(
    params: McpImportParams,
    messageBus: MessageBus,
    toolName?: string,
    displayName?: string,
  ): ToolInvocation<McpImportParams, ToolResult> {
    return new McpImportInvocation(
      this.config,
      params,
      messageBus,
      toolName,
      displayName,
    );
  }
}
