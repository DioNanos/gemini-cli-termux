/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type DOMElement } from 'ink';
import type React from 'react';
import { type MouseEvent } from '../contexts/MouseContext.js';
export declare const useMouseClick: (containerRef: React.RefObject<DOMElement | null>, handler: (event: MouseEvent, relativeX: number, relativeY: number) => void, options?: {
    isActive?: boolean;
    button?: "left" | "right";
}) => void;
