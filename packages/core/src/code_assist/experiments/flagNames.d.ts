/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const ExperimentFlags: {
    readonly CONTEXT_COMPRESSION_THRESHOLD: 45740197;
    readonly USER_CACHING: 45740198;
    readonly BANNER_TEXT_NO_CAPACITY_ISSUES: 45740199;
    readonly BANNER_TEXT_CAPACITY_ISSUES: 45740200;
    readonly ENABLE_PREVIEW: 45740196;
    readonly ENABLE_ADMIN_CONTROLS: 45752213;
};
export type ExperimentFlagName = (typeof ExperimentFlags)[keyof typeof ExperimentFlags];
