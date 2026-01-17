/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { FileChangeStats } from '../utils/rewindFileOps.js';
export declare enum RewindOutcome {
    RewindAndRevert = "rewind_and_revert",
    RewindOnly = "rewind_only",
    RevertOnly = "revert_only",
    Cancel = "cancel"
}
interface RewindConfirmationProps {
    stats: FileChangeStats | null;
    onConfirm: (outcome: RewindOutcome) => void;
    terminalWidth: number;
    timestamp?: string;
}
export declare const RewindConfirmation: React.FC<RewindConfirmationProps>;
export {};
