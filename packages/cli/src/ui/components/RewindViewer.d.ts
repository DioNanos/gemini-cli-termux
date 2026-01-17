/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type ConversationRecord } from '@google/gemini-cli-core';
import { RewindOutcome } from './RewindConfirmation.js';
interface RewindViewerProps {
    conversation: ConversationRecord;
    onExit: () => void;
    onRewind: (messageId: string, newText: string, outcome: RewindOutcome) => void;
}
export declare const RewindViewer: React.FC<RewindViewerProps>;
export {};
