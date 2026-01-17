/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { IdeDiffAcceptedNotificationSchema, IdeDiffRejectedNotificationSchema, } from '@google/gemini-cli-core/src/ide/types.js';
import {} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { DIFF_SCHEME } from './extension.js';
export class DiffContentProvider {
    content = new Map();
    onDidChangeEmitter = new vscode.EventEmitter();
    get onDidChange() {
        return this.onDidChangeEmitter.event;
    }
    provideTextDocumentContent(uri) {
        return this.content.get(uri.toString()) ?? '';
    }
    setContent(uri, content) {
        this.content.set(uri.toString(), content);
        this.onDidChangeEmitter.fire(uri);
    }
    deleteContent(uri) {
        this.content.delete(uri.toString());
    }
    getContent(uri) {
        return this.content.get(uri.toString());
    }
}
/**
 * Manages the state and lifecycle of diff views within the IDE.
 */
export class DiffManager {
    log;
    diffContentProvider;
    onDidChangeEmitter = new vscode.EventEmitter();
    onDidChange = this.onDidChangeEmitter.event;
    diffDocuments = new Map();
    subscriptions = [];
    constructor(log, diffContentProvider) {
        this.log = log;
        this.diffContentProvider = diffContentProvider;
        this.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.onActiveEditorChange(editor);
        }));
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.onActiveEditorChange(vscode.window.activeTextEditor);
    }
    dispose() {
        for (const subscription of this.subscriptions) {
            subscription.dispose();
        }
    }
    /**
     * Creates and shows a new diff view.
     */
    async showDiff(filePath, newContent) {
        const fileUri = vscode.Uri.file(filePath);
        const rightDocUri = vscode.Uri.from({
            scheme: DIFF_SCHEME,
            path: filePath,
            // cache busting
            query: `rand=${Math.random()}`,
        });
        this.diffContentProvider.setContent(rightDocUri, newContent);
        this.addDiffDocument(rightDocUri, {
            originalFilePath: filePath,
            newContent,
            rightDocUri,
        });
        const diffTitle = `${path.basename(filePath)} ↔ Modified`;
        await vscode.commands.executeCommand('setContext', 'gemini.diff.isVisible', true);
        let leftDocUri;
        try {
            await vscode.workspace.fs.stat(fileUri);
            leftDocUri = fileUri;
        }
        catch {
            // We need to provide an empty document to diff against.
            // Using the 'untitled' scheme is one way to do this.
            leftDocUri = vscode.Uri.from({
                scheme: 'untitled',
                path: filePath,
            });
        }
        await vscode.commands.executeCommand('vscode.diff', leftDocUri, rightDocUri, diffTitle, {
            preview: false,
            preserveFocus: true,
        });
        await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession');
    }
    /**
     * Closes an open diff view for a specific file.
     */
    async closeDiff(filePath) {
        let uriToClose;
        for (const [uriString, diffInfo] of this.diffDocuments.entries()) {
            if (diffInfo.originalFilePath === filePath) {
                uriToClose = vscode.Uri.parse(uriString);
                break;
            }
        }
        if (uriToClose) {
            const rightDoc = await vscode.workspace.openTextDocument(uriToClose);
            const modifiedContent = rightDoc.getText();
            await this.closeDiffEditor(uriToClose);
            return modifiedContent;
        }
        return;
    }
    /**
     * User accepts the changes in a diff view. Does not apply changes.
     */
    async acceptDiff(rightDocUri) {
        const diffInfo = this.diffDocuments.get(rightDocUri.toString());
        if (!diffInfo) {
            return;
        }
        const rightDoc = await vscode.workspace.openTextDocument(rightDocUri);
        const modifiedContent = rightDoc.getText();
        await this.closeDiffEditor(rightDocUri);
        this.onDidChangeEmitter.fire(IdeDiffAcceptedNotificationSchema.parse({
            jsonrpc: '2.0',
            method: 'ide/diffAccepted',
            params: {
                filePath: diffInfo.originalFilePath,
                content: modifiedContent,
            },
        }));
    }
    /**
     * Called when a user cancels a diff view.
     */
    async cancelDiff(rightDocUri) {
        const diffInfo = this.diffDocuments.get(rightDocUri.toString());
        if (!diffInfo) {
            await this.closeDiffEditor(rightDocUri);
            return;
        }
        const rightDoc = await vscode.workspace.openTextDocument(rightDocUri);
        const modifiedContent = rightDoc.getText();
        await this.closeDiffEditor(rightDocUri);
        this.onDidChangeEmitter.fire(IdeDiffRejectedNotificationSchema.parse({
            jsonrpc: '2.0',
            method: 'ide/diffRejected',
            params: {
                filePath: diffInfo.originalFilePath,
                content: modifiedContent,
            },
        }));
    }
    async onActiveEditorChange(editor) {
        let isVisible = false;
        if (editor) {
            isVisible = this.diffDocuments.has(editor.document.uri.toString());
            if (!isVisible) {
                for (const document of this.diffDocuments.values()) {
                    if (document.originalFilePath === editor.document.uri.fsPath) {
                        isVisible = true;
                        break;
                    }
                }
            }
        }
        await vscode.commands.executeCommand('setContext', 'gemini.diff.isVisible', isVisible);
    }
    addDiffDocument(uri, diffInfo) {
        this.diffDocuments.set(uri.toString(), diffInfo);
    }
    async closeDiffEditor(rightDocUri) {
        const diffInfo = this.diffDocuments.get(rightDocUri.toString());
        await vscode.commands.executeCommand('setContext', 'gemini.diff.isVisible', false);
        if (diffInfo) {
            this.diffDocuments.delete(rightDocUri.toString());
            this.diffContentProvider.deleteContent(rightDocUri);
        }
        // Find and close the tab corresponding to the diff view
        for (const tabGroup of vscode.window.tabGroups.all) {
            for (const tab of tabGroup.tabs) {
                const input = tab.input;
                if (input && input.modified?.toString() === rightDocUri.toString()) {
                    await vscode.window.tabGroups.close(tab);
                    return;
                }
            }
        }
    }
}
//# sourceMappingURL=diff-manager.js.map