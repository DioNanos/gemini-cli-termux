/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { debugLogger } from './debugLogger.js';
import { Storage } from '../config/storage.js';
const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (...args) => debugLogger.debug('[DEBUG] [ContextMemory]', ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (...args) => debugLogger.warn('[WARN] [ContextMemory]', ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (...args) => debugLogger.warn('[ERROR] [ContextMemory]', ...args),
};
let runtimeContextMemoryOptions = null;
export function setRuntimeContextMemoryOptions(options) {
    runtimeContextMemoryOptions = options;
}
export function getRuntimeContextMemoryOptions() {
    return runtimeContextMemoryOptions;
}
const MAX_SNAPSHOT_ENTRIES = 50;
const MAX_SNAPSHOT_CHARS = 20 * 1024;
const MAX_JOURNAL_BYTES = 2 * 1024 * 1024; // 2MB rotation threshold
// NOTE: import style compatible with tsconfig without esModuleInterop
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ajv = new Ajv({ allErrors: true, strict: true });
const addFormatsFn = addFormats;
addFormatsFn(ajv);
const entrySchema = {
    $id: 'ContextMemoryEntry',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'text'],
    properties: {
        id: { type: 'string', format: 'uuid' },
        text: { type: 'string', minLength: 1 },
        key: { type: 'string', pattern: '^[a-zA-Z0-9._:-]+$' },
        scope: {
            type: 'string',
            pattern: '^(global|host:[a-zA-Z0-9_-]+|project:[a-zA-Z0-9._-]+)$',
        },
        tags: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        expiresAt: { type: 'string', format: 'date-time' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        sensitivity: { type: 'string', enum: ['low', 'medium', 'high'] },
        source: { type: 'string' },
    },
};
const rootSchema = {
    $id: 'ContextMemoryRoot',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'updatedAt', 'entries'],
    properties: {
        version: { type: 'number', const: 1 },
        updatedAt: { type: 'string', format: 'date-time' },
        generatedAt: { type: 'string', format: 'date-time' },
        schemaVersion: { type: 'string' },
        compactionMeta: {
            type: 'object',
            additionalProperties: false,
            properties: {
                journalBytesProcessed: { type: 'number', minimum: 0 },
                lastCompactedAt: { type: 'string', format: 'date-time' },
            },
        },
        entries: { type: 'array', items: { $ref: 'ContextMemoryEntry' } },
    },
};
ajv.addSchema(entrySchema);
ajv.addSchema(rootSchema);
const validateEntry = ajv.getSchema('ContextMemoryEntry');
const validateRoot = ajv.getSchema('ContextMemoryRoot');
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
}
function ensureFile(filePath, defaultContent) {
    if (fs.existsSync(filePath))
        return;
    fs.writeFileSync(filePath, defaultContent, { mode: 0o600 });
}
function safeParse(content, filePath) {
    try {
        return JSON.parse(content);
    }
    catch (err) {
        logger.error(`Failed to parse ${filePath}: ${String(err)}`);
        return null;
    }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function sanitizeEntry(entry) {
    const clone = {
        ...entry,
    };
    if (!clone.id || typeof clone.id !== 'string' || !UUID_RE.test(clone.id)) {
        clone.id = randomUUID();
    }
    if (clone.key && typeof clone.key === 'string') {
        if (!/^[a-zA-Z0-9._:-]+$/.test(clone.key)) {
            clone.key = clone.key.replace(/[^a-zA-Z0-9._:-]/g, '_');
        }
    }
    return clone;
}
function sanitizeRoot(obj) {
    const root = {
        ...obj,
    };
    const entriesArray = Array.isArray(root.entries)
        ? root.entries
        : [];
    const sanitizedEntries = entriesArray.map((e) => sanitizeEntry(e));
    const filtered = sanitizedEntries.filter((e) => typeof e.text === 'string' && e.text.length > 0);
    root.entries = filtered;
    if (!root.updatedAt) {
        root.updatedAt = new Date().toISOString();
    }
    return root;
}
function validateRootOrThrow(obj, filePath) {
    const sanitized = sanitizeRoot(obj);
    if (!validateRoot(sanitized)) {
        const msg = ajv.errorsText(validateRoot.errors);
        throw new Error(`Invalid context memory root for ${filePath}: ${msg}`);
    }
    return sanitized;
}
function validateEntryOrNull(entry, context) {
    if (!validateEntry(entry)) {
        logger.warn(`Invalid entry skipped (${context}): ${ajv.errorsText(validateEntry.errors)}`);
        return null;
    }
    return entry;
}
function hashPathShort(absPath) {
    return crypto.createHash('sha1').update(absPath).digest('hex').slice(0, 8);
}
export function computeProjectScope(absPath) {
    const base = path.basename(absPath);
    return `project:${base}-${hashPathShort(path.resolve(absPath))}`;
}
function sortKey(entry) {
    return (entry.updatedAt ||
        entry.createdAt ||
        entry.expiresAt ||
        entry.__journalAt ||
        new Date().toISOString());
}
function clampChars(entries, maxChars) {
    const out = [];
    let total = 0;
    for (const e of entries) {
        const text = e.text;
        if (text.length > maxChars)
            continue;
        total += text.length;
        if (total > maxChars)
            break;
        out.push(e);
    }
    return out;
}
async function readRoot(filePath) {
    try {
        const raw = await fsp.readFile(filePath, 'utf-8');
        const parsed = safeParse(raw, filePath);
        if (!parsed)
            return null;
        return validateRootOrThrow(parsed, filePath);
    }
    catch (err) {
        logger.error(`Failed reading ${filePath}: ${String(err)}`);
        return null;
    }
}
function writeRoot(filePath, root) {
    const payload = JSON.stringify(root, null, 2) + '\n';
    fs.writeFileSync(filePath, payload, { mode: 0o600 });
}
async function readJournalSlice(journalPath, offset) {
    const stats = await fsp.stat(journalPath);
    if (offset >= stats.size) {
        return { entries: [], bytesRead: 0 };
    }
    const stream = fs.createReadStream(journalPath, {
        start: offset,
        encoding: 'utf-8',
    });
    let buffer = '';
    const entries = [];
    let bytesRead = 0;
    for await (const chunk of stream) {
        const str = chunk;
        bytesRead += Buffer.byteLength(str, 'utf-8');
        buffer += str;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            const parsed = safeParse(trimmed, journalPath);
            if (!parsed)
                continue;
            const journalAt = parsed['at'];
            const entry = validateEntryOrNull({
                id: parsed['id'] ?? randomUUID(),
                text: parsed['text'],
                key: parsed['key'],
                scope: parsed['scope'],
                tags: parsed['tags'],
                createdAt: parsed['created_at'] ?? parsed['createdAt'],
                updatedAt: parsed['updated_at'] ?? parsed['updatedAt'],
                expiresAt: parsed['expires_at'] ?? parsed['expiresAt'],
                confidence: parsed['confidence'],
                sensitivity: parsed['sensitivity'],
                source: parsed['source'],
            }, 'journal');
            if (entry) {
                if (journalAt)
                    entry.__journalAt = journalAt;
                entries.push(entry);
            }
        }
    }
    return { entries, bytesRead };
}
function filterHighSensitivity(entries) {
    return entries.filter((e) => e.sensitivity !== 'high');
}
function enforceKeyRule(entry) {
    if (entry.key)
        return true;
    const hasExpires = !!entry.expiresAt;
    const hasEphemeral = entry.tags?.some((t) => t.toLowerCase() === 'ephemeral') ?? false;
    return hasExpires || hasEphemeral;
}
function mergeEntries(baseList, journalEntries, nowIso) {
    const map = new Map();
    for (const e of baseList) {
        const key = e.key ?? e.id;
        map.set(key, e);
    }
    const now = Date.parse(nowIso);
    for (const e of journalEntries) {
        if (!enforceKeyRule(e)) {
            logger.warn('Skipping entry without key/ephemeral/expires');
            continue;
        }
        if (e.expiresAt && Date.parse(e.expiresAt) < now)
            continue;
        const key = e.key ?? e.id;
        map.set(key, e);
    }
    const merged = Array.from(map.values());
    merged.sort((a, b) => (sortKey(b) > sortKey(a) ? 1 : -1));
    return merged;
}
function pruneSnapshot(entries) {
    const limited = entries.slice(0, MAX_SNAPSHOT_ENTRIES);
    return clampChars(limited, MAX_SNAPSHOT_CHARS);
}
function stripInternal(entry) {
    const { __journalAt, ...rest } = entry;
    return rest;
}
async function rotateJournalIfNeeded(journalPath, size) {
    if (size <= MAX_JOURNAL_BYTES)
        return;
    await fsp.writeFile(journalPath, '', { mode: 0o600 });
}
function toMarkdown(entries, label) {
    if (!entries.length)
        return '';
    const lines = entries.map((e) => {
        const scope = e.scope ? ` (scope: ${e.scope})` : '';
        return `- ${e.text}${scope}`;
    });
    return `--- Context from: ${label} ---\n${lines.join('\n')}\n--- End of Context from: ${label} ---`;
}
export function getDefaultContextMemoryOptions() {
    const dir = path.join(Storage.getGlobalGeminiDir(), 'context_memory');
    return {
        enabled: true,
        primary: 'gemini',
        autoLoadGemini: true,
        autoLoadJsonBase: true,
        autoLoadJsonUser: true,
        allowBaseWrite: false,
        mcpImport: {
            enabled: false,
            categories: [
                'identity',
                'infrastructure',
                'projects',
                'workflow',
                'base',
            ],
            scope: 'global',
        },
        paths: {
            base: path.join(dir, 'base.json'),
            user: path.join(dir, 'user.json'),
            journal: path.join(dir, 'user.journal.jsonl'),
        },
        maxEntries: MAX_SNAPSHOT_ENTRIES,
        maxChars: MAX_SNAPSHOT_CHARS,
        journalThreshold: 500,
        journalMaxAgeDays: 30,
    };
}
export async function loadContextMemory(options, geminiBootstrapText) {
    if (!options.enabled)
        return { files: [], usedPaths: [] };
    const usedPaths = [];
    ensureDir(path.dirname(options.paths.base));
    ensureDir(path.dirname(options.paths.user));
    ensureDir(path.dirname(options.paths.journal));
    ensureFile(options.paths.base, JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        entries: [],
    }, null, 2) + '\n');
    ensureFile(options.paths.journal, '');
    // base
    let baseRoot = null;
    if (options.autoLoadJsonBase) {
        baseRoot = await readRoot(options.paths.base);
        if (baseRoot)
            usedPaths.push(options.paths.base);
    }
    // user
    let userRoot = null;
    const userExists = fs.existsSync(options.paths.user);
    if (options.autoLoadJsonUser && userExists) {
        userRoot = await readRoot(options.paths.user);
    }
    if (!userRoot) {
        if (options.autoLoadJsonUser && geminiBootstrapText) {
            userRoot = {
                version: 1,
                updatedAt: new Date().toISOString(),
                entries: [
                    {
                        id: randomUUID(),
                        text: geminiBootstrapText.trim(),
                        key: 'bootstrap:gemini.md',
                        scope: 'global',
                        source: 'gemini.md',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                compactionMeta: { journalBytesProcessed: 0 },
            };
            writeRoot(options.paths.user, userRoot);
        }
        else if (options.autoLoadJsonUser) {
            userRoot = {
                version: 1,
                updatedAt: new Date().toISOString(),
                entries: [],
                compactionMeta: { journalBytesProcessed: 0 },
            };
            writeRoot(options.paths.user, userRoot);
        }
    }
    if (userRoot && options.autoLoadJsonUser) {
        const offset = userRoot.compactionMeta?.journalBytesProcessed ?? 0;
        const { entries: journalEntries, bytesRead } = await readJournalSlice(options.paths.journal, offset);
        const nowIso = new Date().toISOString();
        const merged = mergeEntries(userRoot.entries, journalEntries, nowIso);
        const pruned = pruneSnapshot(merged).map(stripInternal);
        userRoot.entries = pruned;
        userRoot.updatedAt = nowIso;
        const newOffset = offset + bytesRead;
        userRoot.compactionMeta = {
            journalBytesProcessed: newOffset,
            lastCompactedAt: nowIso,
        };
        writeRoot(options.paths.user, userRoot);
        // rotate journal if too large
        const stat = await fsp.stat(options.paths.journal);
        await rotateJournalIfNeeded(options.paths.journal, stat.size);
        usedPaths.push(options.paths.user);
    }
    const blocks = [];
    const primaryOrder = [
        options.primary,
        'gemini',
        'jsonBase',
        'jsonUser',
    ];
    const order = Array.from(new Set(primaryOrder));
    for (const slot of order) {
        if (slot === 'jsonBase' && baseRoot && options.autoLoadJsonBase) {
            const md = toMarkdown(filterHighSensitivity(baseRoot.entries), options.paths.base);
            if (md.trim())
                blocks.push({ path: options.paths.base, content: md });
        }
        if (slot === 'jsonUser' && userRoot && options.autoLoadJsonUser) {
            const md = toMarkdown(filterHighSensitivity(userRoot.entries), options.paths.user);
            if (md.trim())
                blocks.push({ path: options.paths.user, content: md });
        }
        // gemini handled upstream
    }
    return { files: blocks, usedPaths };
}
export async function appendContextMemoryEntry(text, target = 'user', scope, opts, meta) {
    const defaults = getRuntimeContextMemoryOptions() ?? getDefaultContextMemoryOptions();
    const options = {
        ...defaults,
        ...opts,
        paths: { ...defaults.paths, ...(opts?.paths ?? {}) },
    };
    if (!options.enabled)
        return;
    if (target === 'user') {
        if (!options.autoLoadJsonUser)
            return;
        ensureDir(path.dirname(options.paths.journal));
        ensureFile(options.paths.journal, '');
        const record = {
            op: 'upsert',
            at: new Date().toISOString(),
            id: randomUUID(),
            key: meta?.key,
            scope: scope ?? meta?.scope ?? 'global',
            text,
            tags: meta?.tags,
            expiresAt: meta?.expiresAt,
            sensitivity: meta?.sensitivity,
            source: meta?.source ?? 'tool',
            confidence: meta?.confidence,
        };
        const line = JSON.stringify(record);
        await fsp.appendFile(options.paths.journal, `${line}\n`, { mode: 0o600 });
        return;
    }
    // target === 'base'
    if (!options.allowBaseWrite) {
        throw new Error('Base context memory is read-only. Enable contextMemory.allowBaseWrite in settings to allow writes.');
    }
    ensureDir(path.dirname(options.paths.base));
    ensureFile(options.paths.base, JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        entries: [],
    }, null, 2) + '\n');
    const root = (await readRoot(options.paths.base)) ?? {
        version: 1,
        updatedAt: new Date().toISOString(),
        entries: [],
    };
    const now = new Date().toISOString();
    const newEntry = {
        id: meta?.id && UUID_RE.test(meta.id) ? meta.id : randomUUID(),
        text,
        key: meta?.key,
        scope: scope ?? meta?.scope ?? 'global',
        createdAt: meta?.createdAt ?? now,
        updatedAt: now,
        expiresAt: meta?.expiresAt,
        tags: meta?.tags,
        sensitivity: meta?.sensitivity,
        confidence: meta?.confidence,
        source: meta?.source ?? 'tool',
    };
    if (!newEntry.key)
        newEntry.key = newEntry.id;
    const merged = mergeEntries(root.entries, [newEntry], now);
    root.entries = merged.map(stripInternal);
    root.updatedAt = now;
    writeRoot(options.paths.base, root);
}
// Backwards compatibility helper
export async function appendUserContextMemory(text, scope, opts) {
    return appendContextMemoryEntry(text, 'user', scope, opts);
}
//# sourceMappingURL=contextMemory.js.map