/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BaseDeclarativeTool, BaseToolInvocation, Kind, ToolConfirmationOutcome, } from './tools.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Storage } from '../config/storage.js';
import * as Diff from 'diff';
import { DEFAULT_DIFF_OPTIONS } from './diffOptions.js';
import { tildeifyPath } from '../utils/paths.js';
import { ToolErrorType } from './tool-error.js';
import { MEMORY_TOOL_NAME } from './tool-names.js';
import { appendContextMemoryEntry, } from '../utils/contextMemory.js';
const memoryToolSchemaData = {
    name: MEMORY_TOOL_NAME,
    description: 'Saves a specific piece of information or fact to your long-term memory. Use this when the user explicitly asks you to remember something, or when they state a clear, concise fact that seems important to retain for future interactions.',
    parametersJsonSchema: {
        type: 'object',
        properties: {
            fact: {
                type: 'string',
                description: 'The specific fact or piece of information to remember. Should be a clear, self-contained statement.',
            },
            target: {
                type: 'string',
                enum: ['user', 'base'],
                description: 'Where to store the fact: user (default) writes to user.json/journal; base writes to base.json (requires allowBaseWrite setting).',
            },
            entry: {
                type: 'object',
                description: 'Optional structured fields for the entry (used when saving richer facts).',
                properties: {
                    key: { type: 'string' },
                    scope: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    expiresAt: { type: 'string' },
                    sensitivity: { type: 'string', enum: ['low', 'medium', 'high'] },
                    source: { type: 'string' },
                    confidence: { type: 'number' },
                },
            },
        },
        required: ['fact'],
    },
};
const memoryToolDescription = `
Saves a specific piece of information or fact to your long-term memory.

Use this tool:

- When the user explicitly asks you to remember something (e.g., "Remember that I like pineapple on pizza", "Please save this: my cat's name is Whiskers").
- When the user states a clear, concise fact about themselves, their preferences, or their environment that seems important for you to retain for future interactions to provide a more personalized and effective assistance.

Do NOT use this tool:

- To remember conversational context that is only relevant for the current session.
- To save long, complex, or rambling pieces of text. The fact should be relatively short and to the point.
- If you are unsure whether the information is a fact worth remembering long-term. If in doubt, you can ask the user, "Should I remember that for you?"

## Parameters

- \`fact\` (string, required): The specific fact or piece of information to remember. This should be a clear, self-contained statement. For example, if the user says "My favorite color is blue", the fact would be "My favorite color is blue".`;
export const DEFAULT_CONTEXT_FILENAME = 'GEMINI.md';
export const MEMORY_SECTION_HEADER = '## Gemini Added Memories';
// This variable will hold the currently configured filename for GEMINI.md context files.
// It defaults to DEFAULT_CONTEXT_FILENAME but can be overridden by setGeminiMdFilename.
let currentGeminiMdFilename = DEFAULT_CONTEXT_FILENAME;
export function setGeminiMdFilename(newFilename) {
    if (Array.isArray(newFilename)) {
        if (newFilename.length > 0) {
            currentGeminiMdFilename = newFilename.map((name) => name.trim());
        }
    }
    else if (newFilename && newFilename.trim() !== '') {
        currentGeminiMdFilename = newFilename.trim();
    }
}
export function getCurrentGeminiMdFilename() {
    if (Array.isArray(currentGeminiMdFilename)) {
        return currentGeminiMdFilename[0];
    }
    return currentGeminiMdFilename;
}
export function getAllGeminiMdFilenames() {
    if (Array.isArray(currentGeminiMdFilename)) {
        return currentGeminiMdFilename;
    }
    return [currentGeminiMdFilename];
}
export function getGlobalMemoryFilePath() {
    return path.join(Storage.getGlobalGeminiDir(), getCurrentGeminiMdFilename());
}
/**
 * Ensures proper newline separation before appending content.
 */
function ensureNewlineSeparation(currentContent) {
    if (currentContent.length === 0)
        return '';
    if (currentContent.endsWith('\n\n') || currentContent.endsWith('\r\n\r\n'))
        return '';
    if (currentContent.endsWith('\n') || currentContent.endsWith('\r\n'))
        return '\n';
    return '\n\n';
}
/**
 * Reads the current content of the memory file
 */
async function readMemoryFileContent() {
    try {
        return await fs.readFile(getGlobalMemoryFilePath(), 'utf-8');
    }
    catch (err) {
        const error = err;
        if (!(error instanceof Error) || error.code !== 'ENOENT')
            throw err;
        return '';
    }
}
/**
 * Computes the new content that would result from adding a memory entry
 */
function computeNewContent(currentContent, fact) {
    let processedText = fact.trim();
    processedText = processedText.replace(/^(-+\s*)+/, '').trim();
    const newMemoryItem = `- ${processedText}`;
    const headerIndex = currentContent.indexOf(MEMORY_SECTION_HEADER);
    if (headerIndex === -1) {
        // Header not found, append header and then the entry
        const separator = ensureNewlineSeparation(currentContent);
        return (currentContent +
            `${separator}${MEMORY_SECTION_HEADER}\n${newMemoryItem}\n`);
    }
    else {
        // Header found, find where to insert the new memory entry
        const startOfSectionContent = headerIndex + MEMORY_SECTION_HEADER.length;
        let endOfSectionIndex = currentContent.indexOf('\n## ', startOfSectionContent);
        if (endOfSectionIndex === -1) {
            endOfSectionIndex = currentContent.length; // End of file
        }
        const beforeSectionMarker = currentContent
            .substring(0, startOfSectionContent)
            .trimEnd();
        let sectionContent = currentContent
            .substring(startOfSectionContent, endOfSectionIndex)
            .trimEnd();
        const afterSectionMarker = currentContent.substring(endOfSectionIndex);
        sectionContent += `\n${newMemoryItem}`;
        return (`${beforeSectionMarker}\n${sectionContent.trimStart()}\n${afterSectionMarker}`.trimEnd() +
            '\n');
    }
}
class MemoryToolInvocation extends BaseToolInvocation {
    static allowlist = new Set();
    constructor(params, messageBus, toolName, displayName) {
        super(params, messageBus, toolName, displayName);
    }
    getDescription() {
        const memoryFilePath = getGlobalMemoryFilePath();
        return `in ${tildeifyPath(memoryFilePath)}`;
    }
    async getConfirmationDetails(_abortSignal) {
        const memoryFilePath = getGlobalMemoryFilePath();
        const allowlistKey = memoryFilePath;
        if (MemoryToolInvocation.allowlist.has(allowlistKey)) {
            return false;
        }
        const currentContent = await readMemoryFileContent();
        const newContent = computeNewContent(currentContent, this.params.fact);
        const fileName = path.basename(memoryFilePath);
        const fileDiff = Diff.createPatch(fileName, currentContent, newContent, 'Current', 'Proposed', DEFAULT_DIFF_OPTIONS);
        const confirmationDetails = {
            type: 'edit',
            title: `Confirm Memory Save: ${tildeifyPath(memoryFilePath)}`,
            fileName: memoryFilePath,
            filePath: memoryFilePath,
            fileDiff,
            originalContent: currentContent,
            newContent,
            onConfirm: async (outcome) => {
                if (outcome === ToolConfirmationOutcome.ProceedAlways) {
                    MemoryToolInvocation.allowlist.add(allowlistKey);
                }
                await this.publishPolicyUpdate(outcome);
            },
        };
        return confirmationDetails;
    }
    async execute(_signal) {
        const { fact, modified_by_user, modified_content, target, entry } = this.params;
        try {
            if (modified_by_user && modified_content !== undefined) {
                // User modified the content in external editor, write it directly
                await fs.mkdir(path.dirname(getGlobalMemoryFilePath()), {
                    recursive: true,
                });
                await fs.writeFile(getGlobalMemoryFilePath(), modified_content, 'utf-8');
                const successMessage = `Okay, I've updated the memory file with your modifications.`;
                return {
                    llmContent: JSON.stringify({
                        success: true,
                        message: successMessage,
                    }),
                    returnDisplay: successMessage,
                };
            }
            else {
                // Use the normal memory entry logic
                await MemoryTool.performAddMemoryEntry(fact, getGlobalMemoryFilePath(), {
                    readFile: fs.readFile,
                    writeFile: fs.writeFile,
                    mkdir: fs.mkdir,
                }, target ?? 'user', entry ?? undefined);
                const successMessage = `Okay, I've remembered that: "${fact}"`;
                return {
                    llmContent: JSON.stringify({
                        success: true,
                        message: successMessage,
                    }),
                    returnDisplay: successMessage,
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: JSON.stringify({
                    success: false,
                    error: `Failed to save memory. Detail: ${errorMessage}`,
                }),
                returnDisplay: `Error saving memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                },
            };
        }
    }
}
export class MemoryTool extends BaseDeclarativeTool {
    static Name = MEMORY_TOOL_NAME;
    constructor(messageBus) {
        super(MemoryTool.Name, 'SaveMemory', memoryToolDescription, Kind.Think, memoryToolSchemaData.parametersJsonSchema, messageBus, true, false);
    }
    validateToolParamValues(params) {
        if (params.fact.trim() === '') {
            return 'Parameter "fact" must be a non-empty string.';
        }
        if (params.target && params.target !== 'user' && params.target !== 'base') {
            return 'Parameter "target" must be "user" or "base" if provided.';
        }
        if (params.entry && typeof params.entry !== 'object') {
            return 'Parameter "entry" must be an object if provided.';
        }
        return null;
    }
    createInvocation(params, messageBus, toolName, displayName) {
        return new MemoryToolInvocation(params, messageBus, toolName ?? this.name, displayName ?? this.displayName);
    }
    static async performAddMemoryEntry(text, memoryFilePath, fsAdapter, target = 'user', entry) {
        try {
            await fsAdapter.mkdir(path.dirname(memoryFilePath), { recursive: true });
            let currentContent = '';
            try {
                currentContent = await fsAdapter.readFile(memoryFilePath, 'utf-8');
            }
            catch (_e) {
                // File doesn't exist, which is fine. currentContent will be empty.
            }
            const newContent = computeNewContent(currentContent, text);
            await fsAdapter.writeFile(memoryFilePath, newContent, 'utf-8');
            // Also persist into JSON context memory (append-only journal or base)
            try {
                const meta = entry
                    ? {
                        ...entry,
                        scope: entry.scope,
                    }
                    : undefined;
                await appendContextMemoryEntry(text, target, entry?.scope, undefined, meta);
            }
            catch (err) {
                console.warn('[MemoryTool] Failed to mirror entry to context memory:', err);
            }
        }
        catch (error) {
            throw new Error(`[MemoryTool] Failed to add memory entry: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getModifyContext(_abortSignal) {
        return {
            getFilePath: (_params) => getGlobalMemoryFilePath(),
            getCurrentContent: async (_params) => readMemoryFileContent(),
            getProposedContent: async (params) => {
                const currentContent = await readMemoryFileContent();
                return computeNewContent(currentContent, params.fact);
            },
            createUpdatedParams: (_oldContent, modifiedProposedContent, originalParams) => ({
                ...originalParams,
                modified_by_user: true,
                modified_content: modifiedProposedContent,
            }),
        };
    }
}
//# sourceMappingURL=memoryTool.js.map