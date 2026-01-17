/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type RetrieveUserQuotaResponse } from '@google/gemini-cli-core';
interface StatsDisplayProps {
    duration: string;
    title?: string;
    quotas?: RetrieveUserQuotaResponse;
}
export declare const StatsDisplay: React.FC<StatsDisplayProps>;
export {};
