/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CodeAssistServer } from '../server.js';
import type { Flag } from './types.js';
export interface Experiments {
    flags: Record<string, Flag>;
    experimentIds: number[];
}
/**
 * Gets the experiments from the server.
 *
 * The experiments are cached so that they are only fetched once.
 */
export declare function getExperiments(server?: CodeAssistServer): Promise<Experiments>;
