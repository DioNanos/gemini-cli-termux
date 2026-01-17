/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ToolCallStatus } from '../../types.js';
export declare const STATUS_INDICATOR_WIDTH = 3;
export type TextEmphasis = 'high' | 'medium' | 'low';
type ToolStatusIndicatorProps = {
    status: ToolCallStatus;
    name: string;
};
export declare const ToolStatusIndicator: React.FC<ToolStatusIndicatorProps>;
type ToolInfoProps = {
    name: string;
    description: string;
    status: ToolCallStatus;
    emphasis: TextEmphasis;
};
export declare const ToolInfo: React.FC<ToolInfoProps>;
export declare const TrailingIndicator: React.FC;
export {};
