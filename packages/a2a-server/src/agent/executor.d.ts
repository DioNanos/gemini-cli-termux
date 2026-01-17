/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Task as SDKTask } from '@a2a-js/sdk';
import type { TaskStore, AgentExecutor, RequestContext, ExecutionEventBus } from '@a2a-js/sdk/server';
import type { AgentSettings } from '../types.js';
import { Task } from './task.js';
/**
 * Provides a wrapper for Task. Passes data from Task to SDKTask.
 * The idea is to use this class inside CoderAgentExecutor to replace Task.
 */
declare class TaskWrapper {
    task: Task;
    agentSettings: AgentSettings;
    constructor(task: Task, agentSettings: AgentSettings);
    get id(): string;
    toSDKTask(): SDKTask;
}
/**
 * CoderAgentExecutor implements the agent's core logic for code generation.
 */
export declare class CoderAgentExecutor implements AgentExecutor {
    private taskStore?;
    private tasks;
    private executingTasks;
    constructor(taskStore?: TaskStore | undefined);
    private getConfig;
    /**
     * Reconstructs TaskWrapper from SDKTask.
     */
    reconstruct(sdkTask: SDKTask, eventBus?: ExecutionEventBus): Promise<TaskWrapper>;
    createTask(taskId: string, contextId: string, agentSettingsInput?: AgentSettings, eventBus?: ExecutionEventBus): Promise<TaskWrapper>;
    getTask(taskId: string): TaskWrapper | undefined;
    getAllTasks(): TaskWrapper[];
    cancelTask: (taskId: string, eventBus: ExecutionEventBus) => Promise<void>;
    execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void>;
}
export {};
