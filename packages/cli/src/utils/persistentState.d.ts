/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
interface PersistentStateData {
    defaultBannerShownCount?: Record<string, number>;
}
export declare class PersistentState {
    private cache;
    private filePath;
    private getPath;
    private load;
    private save;
    get<K extends keyof PersistentStateData>(key: K): PersistentStateData[K] | undefined;
    set<K extends keyof PersistentStateData>(key: K, value: PersistentStateData[K]): void;
}
export declare const persistentState: PersistentState;
export {};
