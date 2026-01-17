/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Task as SDKTask } from '@a2a-js/sdk';
import type { TaskStore } from '@a2a-js/sdk/server';
export declare class GCSTaskStore implements TaskStore {
    private storage;
    private bucketName;
    private bucketInitialized;
    constructor(bucketName: string);
    private initializeBucket;
    private ensureBucketInitialized;
    private getObjectPath;
    save(task: SDKTask): Promise<void>;
    load(taskId: string): Promise<SDKTask | undefined>;
}
export declare class NoOpTaskStore implements TaskStore {
    private realStore;
    constructor(realStore: TaskStore);
    save(task: SDKTask): Promise<void>;
    load(taskId: string): Promise<SDKTask | undefined>;
}
