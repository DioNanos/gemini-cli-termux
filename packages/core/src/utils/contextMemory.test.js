/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { loadContextMemory, getDefaultContextMemoryOptions, computeProjectScope, appendContextMemoryEntry, } from './contextMemory.js';
function tmpDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'ctxmem-'));
}
function makeOptions(dir) {
    const defaults = getDefaultContextMemoryOptions();
    return {
        ...defaults,
        paths: {
            base: path.join(dir, 'base.json'),
            user: path.join(dir, 'user.json'),
            journal: path.join(dir, 'user.journal.jsonl'),
        },
    };
}
function writeRoot(filePath, root) {
    fs.writeFileSync(filePath, JSON.stringify(root, null, 2));
}
describe('contextMemory', () => {
    beforeEach(() => {
        // ensure clean tmp per test
    });
    it('dedups by key and keeps latest text', async () => {
        const dir = tmpDir();
        const opts = makeOptions(dir);
        const baseRoot = {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [],
        };
        writeRoot(opts.paths.base, baseRoot);
        const userRoot = {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [
                {
                    id: randomUUID(),
                    key: 'k1',
                    text: 'old',
                    scope: 'global',
                },
            ],
            compactionMeta: { journalBytesProcessed: 0 },
        };
        writeRoot(opts.paths.user, userRoot);
        const line = {
            op: 'upsert',
            at: new Date().toISOString(),
            id: randomUUID(),
            key: 'k1',
            text: 'new',
            scope: 'global',
        };
        fs.writeFileSync(opts.paths.journal, JSON.stringify(line) + '\n');
        const res = await loadContextMemory(opts);
        expect(res.usedPaths).toContain(opts.paths.user);
        const user = JSON.parse(fs.readFileSync(opts.paths.user, 'utf-8'));
        expect(user.entries[0].text).toBe('new');
    });
    it('computes unique project scope with hash', () => {
        const a = computeProjectScope('/tmp/proj');
        const b = computeProjectScope('/other/proj');
        expect(a).not.toBe(b);
        expect(a.startsWith('project:proj-')).toBe(true);
    });
    it('processes journal incrementally using bytes offset', async () => {
        const dir = tmpDir();
        const opts = makeOptions(dir);
        writeRoot(opts.paths.base, {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [],
        });
        writeRoot(opts.paths.user, {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [],
            compactionMeta: { journalBytesProcessed: 0 },
        });
        const line1 = JSON.stringify({
            op: 'upsert',
            at: new Date().toISOString(),
            id: randomUUID(),
            key: 'kA',
            text: 'first',
            scope: 'global',
        });
        fs.writeFileSync(opts.paths.journal, line1 + '\n');
        // First load processes first line
        await loadContextMemory(opts);
        const offsetAfterFirst = JSON.parse(fs.readFileSync(opts.paths.user, 'utf-8')).compactionMeta.journalBytesProcessed;
        const line2 = JSON.stringify({
            op: 'upsert',
            at: new Date().toISOString(),
            id: randomUUID(),
            key: 'kB',
            text: 'second',
            scope: 'global',
        });
        fs.appendFileSync(opts.paths.journal, line2 + '\n');
        await loadContextMemory(opts);
        const user = JSON.parse(fs.readFileSync(opts.paths.user, 'utf-8'));
        const keys = user.entries.map((e) => e.key);
        expect(keys).toContain('kB');
        const offsetAfterSecond = user.compactionMeta.journalBytesProcessed;
        expect(offsetAfterSecond).toBeGreaterThan(offsetAfterFirst);
    });
    it('filters sensitivity high from autoload output', async () => {
        const dir = tmpDir();
        const opts = makeOptions(dir);
        writeRoot(opts.paths.base, {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [],
        });
        writeRoot(opts.paths.user, {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [
                {
                    id: randomUUID(),
                    text: 'secret',
                    sensitivity: 'high',
                    scope: 'global',
                },
            ],
            compactionMeta: { journalBytesProcessed: 0 },
        });
        fs.writeFileSync(opts.paths.journal, '');
        const res = await loadContextMemory(opts);
        const content = res.files.map((f) => f.content).join('\n');
        expect(content).not.toContain('secret');
    });
    it('rejects entries without key unless ephemeral/expiring', async () => {
        const dir = tmpDir();
        const opts = makeOptions(dir);
        writeRoot(opts.paths.base, {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [],
        });
        writeRoot(opts.paths.user, {
            version: 1,
            updatedAt: new Date().toISOString(),
            entries: [],
            compactionMeta: { journalBytesProcessed: 0 },
        });
        const bad = JSON.stringify({
            op: 'upsert',
            at: new Date().toISOString(),
            id: randomUUID(),
            text: 'no-key-no-expire',
            scope: 'global',
        });
        fs.writeFileSync(opts.paths.journal, bad + '\n');
        await loadContextMemory(opts);
        const user = JSON.parse(fs.readFileSync(opts.paths.user, 'utf-8'));
        expect(user.entries.length).toBe(0);
    });
    it('blocks base writes when allowBaseWrite=false', async () => {
        const dir = tmpDir();
        const opts = makeOptions(dir);
        await expect(appendContextMemoryEntry('cannot-write', 'base', 'global', opts)).rejects.toThrow(/Base context memory is read-only/);
    });
    it('allows base writes when allowBaseWrite=true', async () => {
        const dir = tmpDir();
        const opts = { ...makeOptions(dir), allowBaseWrite: true };
        await appendContextMemoryEntry('store-in-base', 'base', 'global', opts);
        const base = JSON.parse(fs.readFileSync(opts.paths.base, 'utf-8'));
        expect(base.entries[0].text).toBe('store-in-base');
    });
});
//# sourceMappingURL=contextMemory.test.js.map