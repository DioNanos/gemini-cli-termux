/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { TextBuffer } from './text-buffer.js';
export interface TextInputProps {
    buffer: TextBuffer;
    placeholder?: string;
    onSubmit?: (value: string) => void;
    onCancel?: () => void;
    focus?: boolean;
}
export declare function TextInput({ buffer, placeholder, onSubmit, onCancel, focus, }: TextInputProps): React.JSX.Element;
