/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as vscode from 'vscode';
import type { IdeContext } from '@google/gemini-cli-core/src/ide/types.js';
export declare const MAX_FILES = 10;
/**
 * Keeps track of the workspace state, including open files, cursor position, and selected text.
 */
export declare class OpenFilesManager {
    private readonly context;
    private readonly onDidChangeEmitter;
    readonly onDidChange: vscode.Event<void>;
    private debounceTimer;
    private openFiles;
    constructor(context: vscode.ExtensionContext);
    private isFileUri;
    private addOrMoveToFront;
    private remove;
    private rename;
    private updateActiveContext;
    private fireWithDebounce;
    get state(): IdeContext;
}
