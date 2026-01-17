/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
type SuccessfulPathCorrection = {
    success: true;
    correctedPath: string;
};
type FailedPathCorrection = {
    success: false;
    error: string;
};
/**
 * Attempts to correct a relative or ambiguous file path to a single, absolute path
 * within the workspace.
 *
 * @param filePath The file path to correct.
 * @param config The application configuration.
 * @returns A `PathCorrectionResult` object with either a `correctedPath` or an `error`.
 */
export type PathCorrectionResult = SuccessfulPathCorrection | FailedPathCorrection;
export declare function correctPath(filePath: string, config: Config): PathCorrectionResult;
export {};
