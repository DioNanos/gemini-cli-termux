/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export type ContextMemoryScope = 'global' | `host:${string}` | `project:${string}`;
export interface ContextMemoryEntry {
    id: string;
    text: string;
    key?: string;
    scope?: ContextMemoryScope;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    expiresAt?: string;
    confidence?: number;
    sensitivity?: 'low' | 'medium' | 'high';
    source?: string;
    __journalAt?: string;
}
export interface ContextMemoryRoot {
    version: number;
    updatedAt: string;
    generatedAt?: string;
    schemaVersion?: string;
    compactionMeta?: {
        journalBytesProcessed?: number;
        lastCompactedAt?: string;
    };
    entries: ContextMemoryEntry[];
}
export interface ContextMemoryOptions {
    enabled: boolean;
    primary: 'gemini' | 'jsonBase' | 'jsonUser';
    autoLoadGemini: boolean;
    autoLoadJsonBase: boolean;
    autoLoadJsonUser: boolean;
    allowBaseWrite: boolean;
    mcpImport: {
        enabled: boolean;
        categories: string[];
        scope: string;
    };
    paths: {
        base: string;
        user: string;
        journal: string;
    };
    maxEntries: number;
    maxChars: number;
    journalThreshold: number;
    journalMaxAgeDays: number;
}
export interface ContextMemoryLoadResult {
    files: Array<{
        path: string;
        content: string;
    }>;
    usedPaths: string[];
}
export declare function setRuntimeContextMemoryOptions(options: ContextMemoryOptions): void;
export declare function getRuntimeContextMemoryOptions(): ContextMemoryOptions | null;
export declare function computeProjectScope(absPath: string): ContextMemoryScope;
export declare function getDefaultContextMemoryOptions(): ContextMemoryOptions;
export declare function loadContextMemory(options: ContextMemoryOptions, geminiBootstrapText?: string): Promise<ContextMemoryLoadResult>;
export declare function appendContextMemoryEntry(text: string, target?: 'user' | 'base', scope?: ContextMemoryScope, opts?: Partial<ContextMemoryOptions>, meta?: Partial<ContextMemoryEntry>): Promise<void>;
export declare function appendUserContextMemory(text: string, scope?: ContextMemoryScope, opts?: Partial<ContextMemoryOptions>): Promise<void>;
