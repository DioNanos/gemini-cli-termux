/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { ToolMessageProps } from './ToolMessage.js';
import type { Config } from '@google/gemini-cli-core';
export interface ShellToolMessageProps extends ToolMessageProps {
    activeShellPtyId?: number | null;
    embeddedShellFocused?: boolean;
    config?: Config;
}
export declare const ShellToolMessage: React.FC<ShellToolMessageProps>;
