/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { TestRig } from '@google/gemini-cli-test-utils';
export * from '@google/gemini-cli-test-utils';
export type EvalPolicy = 'ALWAYS_PASSES' | 'USUALLY_PASSES';
export declare function evalTest(policy: EvalPolicy, evalCase: EvalCase): void;
export interface EvalCase {
    name: string;
    params?: Record<string, any>;
    prompt: string;
    files?: Record<string, string>;
    assert: (rig: TestRig, result: string) => Promise<void>;
}
