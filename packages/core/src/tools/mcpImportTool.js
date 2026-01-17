/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, BaseToolInvocation, Kind, } from './tools.js';
import { appendContextMemoryEntry, } from '../utils/contextMemory.js';
import { ToolErrorType } from './tool-error.js';
const schema = {
    name: 'mcp_import_memory',
    description: 'Import MCP memory data into local context memory. Intended to be called after reading categories via MCP (e.g., memory_read). Writes to base.json by default (requires allowBaseWrite=true).',
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
function flattenObject(obj, prefix = '', out = []) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v === null || v === undefined)
            continue;
        if (typeof v === 'object' && !Array.isArray(v)) {
            flattenObject(v, key, out);
        }
        else if (Array.isArray(v)) {
            const text = v.length <= 10
                ? v.join(', ')
                : `${v.slice(0, 5).join(', ')} ... (+${v.length - 5})`;
            out.push({ key, text });
        }
        else {
            out.push({ key, text: String(v) });
        }
    }
    return out;
}
class McpImportInvocation extends BaseToolInvocation {
    config;
    constructor(config, params, messageBus, toolName, displayName) {
        super(params, messageBus, toolName, displayName);
        this.config = config;
    }
    getDescription() {
        return 'Imports MCP memory data or payload into local context memory (base or user).';
    }
    async execute(_signal) {
        const options = this.config.getContextMemoryOptions();
        if (!options?.mcpImport?.enabled) {
            return {
                llmContent: 'MCP import is disabled in settings (contextMemory.mcpImport.enabled=false).',
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
                llmContent: 'Base memory is read-only. Enable Allow Base Memory Writes to import into base.json.',
                returnDisplay: 'Base memory is read-only. Enable the setting to proceed.',
                error: {
                    message: 'Base write not allowed',
                    type: ToolErrorType.PERMISSION_DENIED,
                },
            };
        }
        const scope = this.params.scope ||
            options.mcpImport.scope ||
            'global';
        let entries = this.params.entries?.map((e) => ({ ...e })) ??
            [];
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
        const written = [];
        for (const entry of entries) {
            if (!entry?.text)
                continue;
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
export class McpImportTool extends BaseDeclarativeTool {
    config;
    static Name = 'mcp_import_memory';
    constructor(config, messageBus) {
        super(McpImportTool.Name, 'ImportMemory', schema.description, Kind.Other, schema.parametersJsonSchema, messageBus);
        this.config = config;
    }
    createInvocation(params, messageBus, toolName, displayName) {
        return new McpImportInvocation(this.config, params, messageBus, toolName, displayName);
    }
}
//# sourceMappingURL=mcpImportTool.js.map