/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Storage, debugLogger } from '@google/gemini-cli-core';
import * as fs from 'node:fs';
import * as path from 'node:path';
const STATE_FILENAME = 'state.json';
export class PersistentState {
    cache = null;
    filePath = null;
    getPath() {
        if (!this.filePath) {
            this.filePath = path.join(Storage.getGlobalGeminiDir(), STATE_FILENAME);
        }
        return this.filePath;
    }
    load() {
        if (this.cache) {
            return this.cache;
        }
        try {
            const filePath = this.getPath();
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                this.cache = JSON.parse(content);
            }
            else {
                this.cache = {};
            }
        }
        catch (error) {
            debugLogger.warn('Failed to load persistent state:', error);
            // If error reading (e.g. corrupt JSON), start fresh
            this.cache = {};
        }
        return this.cache;
    }
    save() {
        if (!this.cache)
            return;
        try {
            const filePath = this.getPath();
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify(this.cache, null, 2));
        }
        catch (error) {
            debugLogger.warn('Failed to save persistent state:', error);
        }
    }
    get(key) {
        return this.load()[key];
    }
    set(key, value) {
        this.load(); // ensure loaded
        this.cache[key] = value;
        this.save();
    }
}
export const persistentState = new PersistentState();
//# sourceMappingURL=persistentState.js.map