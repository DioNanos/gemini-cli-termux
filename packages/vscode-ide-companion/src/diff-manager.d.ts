/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as vscode from 'vscode';
export declare class DiffContentProvider implements vscode.TextDocumentContentProvider {
    private content;
    private onDidChangeEmitter;
    get onDidChange(): vscode.Event<vscode.Uri>;
    provideTextDocumentContent(uri: vscode.Uri): string;
    setContent(uri: vscode.Uri, content: string): void;
    deleteContent(uri: vscode.Uri): void;
    getContent(uri: vscode.Uri): string | undefined;
}
/**
 * Manages the state and lifecycle of diff views within the IDE.
 */
export declare class DiffManager {
    private readonly log;
    private readonly diffContentProvider;
    private readonly onDidChangeEmitter;
    readonly onDidChange: vscode.Event<JSONRPCNotification>;
    private diffDocuments;
    private readonly subscriptions;
    constructor(log: (message: string) => void, diffContentProvider: DiffContentProvider);
    dispose(): void;
    /**
     * Creates and shows a new diff view.
     */
    showDiff(filePath: string, newContent: string): Promise<void>;
    /**
     * Closes an open diff view for a specific file.
     */
    closeDiff(filePath: string): Promise<string | undefined>;
    /**
     * User accepts the changes in a diff view. Does not apply changes.
     */
    acceptDiff(rightDocUri: vscode.Uri): Promise<void>;
    /**
     * Called when a user cancels a diff view.
     */
    cancelDiff(rightDocUri: vscode.Uri): Promise<void>;
    private onActiveEditorChange;
    private addDiffDocument;
    private closeDiffEditor;
}
