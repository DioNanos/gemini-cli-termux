/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface ApiAuthDialogProps {
    onSubmit: (apiKey: string) => void;
    onCancel: () => void;
    error?: string | null;
    defaultValue?: string;
}
export declare function ApiAuthDialog({ onSubmit, onCancel, error, defaultValue, }: ApiAuthDialogProps): React.JSX.Element;
export {};
