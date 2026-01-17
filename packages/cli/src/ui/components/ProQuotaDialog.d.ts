/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface ProQuotaDialogProps {
    failedModel: string;
    fallbackModel: string;
    message: string;
    isTerminalQuotaError: boolean;
    isModelNotFoundError?: boolean;
    onChoice: (choice: 'retry_later' | 'retry_once' | 'retry_always' | 'upgrade') => void;
}
export declare function ProQuotaDialog({ failedModel, fallbackModel, message, isTerminalQuotaError, isModelNotFoundError, onChoice, }: ProQuotaDialogProps): React.JSX.Element;
export {};
