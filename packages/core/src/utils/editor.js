/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { execSync, spawn, spawnSync } from 'node:child_process';
import { debugLogger } from './debugLogger.js';
import { coreEvents, CoreEvent } from './events.js';
const GUI_EDITORS = [
    'vscode',
    'vscodium',
    'windsurf',
    'cursor',
    'zed',
    'antigravity',
];
const TERMINAL_EDITORS = ['vim', 'neovim', 'emacs', 'hx'];
const EDITORS = [...GUI_EDITORS, ...TERMINAL_EDITORS];
const GUI_EDITORS_SET = new Set(GUI_EDITORS);
const TERMINAL_EDITORS_SET = new Set(TERMINAL_EDITORS);
const EDITORS_SET = new Set(EDITORS);
export const DEFAULT_GUI_EDITOR = 'vscode';
export function isGuiEditor(editor) {
    return GUI_EDITORS_SET.has(editor);
}
export function isTerminalEditor(editor) {
    return TERMINAL_EDITORS_SET.has(editor);
}
export const EDITOR_DISPLAY_NAMES = {
    vscode: 'VS Code',
    vscodium: 'VSCodium',
    windsurf: 'Windsurf',
    cursor: 'Cursor',
    vim: 'Vim',
    neovim: 'Neovim',
    zed: 'Zed',
    emacs: 'Emacs',
    antigravity: 'Antigravity',
    hx: 'Helix',
};
export function getEditorDisplayName(editor) {
    return EDITOR_DISPLAY_NAMES[editor] || editor;
}
function isValidEditorType(editor) {
    return EDITORS_SET.has(editor);
}
/**
 * Escapes a string for use in an Emacs Lisp string literal.
 * Wraps in double quotes and escapes backslashes and double quotes.
 */
function escapeELispString(str) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
function commandExists(cmd) {
    try {
        execSync(process.platform === 'win32' ? `where.exe ${cmd}` : `command -v ${cmd}`, { stdio: 'ignore' });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Editor command configurations for different platforms.
 * Each editor can have multiple possible command names, listed in order of preference.
 */
const editorCommands = {
    vscode: { win32: ['code.cmd'], default: ['code'] },
    vscodium: { win32: ['codium.cmd'], default: ['codium'] },
    windsurf: { win32: ['windsurf'], default: ['windsurf'] },
    cursor: { win32: ['cursor'], default: ['cursor'] },
    vim: { win32: ['vim'], default: ['vim'] },
    neovim: { win32: ['nvim'], default: ['nvim'] },
    zed: { win32: ['zed'], default: ['zed', 'zeditor'] },
    emacs: { win32: ['emacs.exe'], default: ['emacs'] },
    antigravity: { win32: ['agy.cmd'], default: ['agy'] },
    hx: { win32: ['hx'], default: ['hx'] },
};
export function checkHasEditorType(editor) {
    const commandConfig = editorCommands[editor];
    const commands = process.platform === 'win32' ? commandConfig.win32 : commandConfig.default;
    return commands.some((cmd) => commandExists(cmd));
}
export function getEditorCommand(editor) {
    const commandConfig = editorCommands[editor];
    const commands = process.platform === 'win32' ? commandConfig.win32 : commandConfig.default;
    return (commands.slice(0, -1).find((cmd) => commandExists(cmd)) ||
        commands[commands.length - 1]);
}
export function allowEditorTypeInSandbox(editor) {
    const notUsingSandbox = !process.env['SANDBOX'];
    if (isGuiEditor(editor)) {
        return notUsingSandbox;
    }
    // For terminal-based editors like vim and emacs, allow in sandbox.
    return true;
}
/**
 * Check if the editor is valid and can be used.
 * Returns false if preferred editor is not set / invalid / not available / not allowed in sandbox.
 */
export function isEditorAvailable(editor) {
    if (editor && isValidEditorType(editor)) {
        return checkHasEditorType(editor) && allowEditorTypeInSandbox(editor);
    }
    return false;
}
/**
 * Get the diff command for a specific editor.
 */
export function getDiffCommand(oldPath, newPath, editor) {
    if (!isValidEditorType(editor)) {
        return null;
    }
    const command = getEditorCommand(editor);
    switch (editor) {
        case 'vscode':
        case 'vscodium':
        case 'windsurf':
        case 'cursor':
        case 'zed':
        case 'antigravity':
            return { command, args: ['--wait', '--diff', oldPath, newPath] };
        case 'vim':
        case 'neovim':
            return {
                command,
                args: [
                    '-d',
                    // skip viminfo file to avoid E138 errors
                    '-i',
                    'NONE',
                    // make the left window read-only and the right window editable
                    '-c',
                    'wincmd h | set readonly | wincmd l',
                    // set up colors for diffs
                    '-c',
                    'highlight DiffAdd cterm=bold ctermbg=22 guibg=#005f00 | highlight DiffChange cterm=bold ctermbg=24 guibg=#005f87 | highlight DiffText ctermbg=21 guibg=#0000af | highlight DiffDelete ctermbg=52 guibg=#5f0000',
                    // Show helpful messages
                    '-c',
                    'set showtabline=2 | set tabline=[Instructions]\\ :wqa(save\\ &\\ quit)\\ \\|\\ i/esc(toggle\\ edit\\ mode)',
                    '-c',
                    'wincmd h | setlocal statusline=OLD\\ FILE',
                    '-c',
                    'wincmd l | setlocal statusline=%#StatusBold#NEW\\ FILE\\ :wqa(save\\ &\\ quit)\\ \\|\\ i/esc(toggle\\ edit\\ mode)',
                    // Auto close all windows when one is closed
                    '-c',
                    'autocmd BufWritePost * wqa',
                    oldPath,
                    newPath,
                ],
            };
        case 'emacs':
            return {
                command: 'emacs',
                args: [
                    '--eval',
                    `(ediff ${escapeELispString(oldPath)} ${escapeELispString(newPath)})`,
                ],
            };
        case 'hx':
            return {
                command: 'hx',
                args: ['--vsplit', '--', oldPath, newPath],
            };
        default:
            return null;
    }
}
/**
 * Opens a diff tool to compare two files.
 * Terminal-based editors by default blocks parent process until the editor exits.
 * GUI-based editors require args such as "--wait" to block parent process.
 */
export async function openDiff(oldPath, newPath, editor) {
    const diffCommand = getDiffCommand(oldPath, newPath, editor);
    if (!diffCommand) {
        debugLogger.error('No diff tool available. Install a supported editor.');
        return;
    }
    if (isTerminalEditor(editor)) {
        try {
            const result = spawnSync(diffCommand.command, diffCommand.args, {
                stdio: 'inherit',
            });
            if (result.error) {
                throw result.error;
            }
            if (result.status !== 0) {
                throw new Error(`${editor} exited with code ${result.status}`);
            }
        }
        finally {
            coreEvents.emit(CoreEvent.ExternalEditorClosed);
        }
        return;
    }
    return new Promise((resolve, reject) => {
        const childProcess = spawn(diffCommand.command, diffCommand.args, {
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`${editor} exited with code ${code}`));
            }
        });
        childProcess.on('error', (error) => {
            reject(error);
        });
    });
}
//# sourceMappingURL=editor.js.map