/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface HooksListProps {
    hooks: ReadonlyArray<{
        config: {
            command?: string;
            type: string;
            name?: string;
            description?: string;
            timeout?: number;
        };
        source: string;
        eventName: string;
        matcher?: string;
        sequential?: boolean;
        enabled: boolean;
    }>;
}
export declare const HooksList: React.FC<HooksListProps>;
export {};
