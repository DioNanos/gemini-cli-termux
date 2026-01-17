/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type HistoryItem } from '../types.js';
import type { Config } from '@google/gemini-cli-core';
export declare enum MultiFolderTrustChoice {
    YES = 0,
    YES_AND_REMEMBER = 1,
    NO = 2
}
export interface MultiFolderTrustDialogProps {
    folders: string[];
    onComplete: () => void;
    trustedDirs: string[];
    errors: string[];
    finishAddingDirectories: (config: Config, addItem: (itemData: Omit<HistoryItem, 'id'>, baseTimestamp?: number) => number, added: string[], errors: string[]) => Promise<void>;
    config: Config;
    addItem: (itemData: Omit<HistoryItem, 'id'>, baseTimestamp?: number) => number;
}
export declare const MultiFolderTrustDialog: React.FC<MultiFolderTrustDialogProps>;
