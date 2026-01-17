/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
declare const GUI_EDITORS: readonly ["vscode", "vscodium", "windsurf", "cursor", "zed", "antigravity"];
declare const TERMINAL_EDITORS: readonly ["vim", "neovim", "emacs", "hx"];
declare const EDITORS: readonly ["vscode", "vscodium", "windsurf", "cursor", "zed", "antigravity", "vim", "neovim", "emacs", "hx"];
export declare const DEFAULT_GUI_EDITOR: GuiEditorType;
export type GuiEditorType = (typeof GUI_EDITORS)[number];
export type TerminalEditorType = (typeof TERMINAL_EDITORS)[number];
export type EditorType = (typeof EDITORS)[number];
export declare function isGuiEditor(editor: EditorType): editor is GuiEditorType;
export declare function isTerminalEditor(editor: EditorType): editor is TerminalEditorType;
export declare const EDITOR_DISPLAY_NAMES: Record<EditorType, string>;
export declare function getEditorDisplayName(editor: EditorType): string;
interface DiffCommand {
    command: string;
    args: string[];
}
export declare function checkHasEditorType(editor: EditorType): boolean;
export declare function getEditorCommand(editor: EditorType): string;
export declare function allowEditorTypeInSandbox(editor: EditorType): boolean;
/**
 * Check if the editor is valid and can be used.
 * Returns false if preferred editor is not set / invalid / not available / not allowed in sandbox.
 */
export declare function isEditorAvailable(editor: string | undefined): boolean;
/**
 * Get the diff command for a specific editor.
 */
export declare function getDiffCommand(oldPath: string, newPath: string, editor: EditorType): DiffCommand | null;
/**
 * Opens a diff tool to compare two files.
 * Terminal-based editors by default blocks parent process until the editor exits.
 * GUI-based editors require args such as "--wait" to block parent process.
 */
export declare function openDiff(oldPath: string, newPath: string, editor: EditorType): Promise<void>;
export {};
