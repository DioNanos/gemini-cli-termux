/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type MouseEvent, type MouseEventName, type MouseHandler } from '../utils/mouse.js';
export type { MouseEvent, MouseEventName, MouseHandler };
interface MouseContextValue {
    subscribe: (handler: MouseHandler) => void;
    unsubscribe: (handler: MouseHandler) => void;
}
export declare function useMouseContext(): MouseContextValue;
export declare function useMouse(handler: MouseHandler, { isActive }?: {
    isActive?: boolean | undefined;
}): void;
export declare function MouseProvider({ children, mouseEventsEnabled, debugKeystrokeLogging, }: {
    children: React.ReactNode;
    mouseEventsEnabled?: boolean;
    debugKeystrokeLogging?: boolean;
}): import("react/jsx-runtime").JSX.Element;
