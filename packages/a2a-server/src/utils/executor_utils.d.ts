/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ExecutionEventBus } from '@a2a-js/sdk/server';
export declare function pushTaskStateFailed(error: unknown, eventBus: ExecutionEventBus, taskId: string, contextId: string): Promise<void>;
