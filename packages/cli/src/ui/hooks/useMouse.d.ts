/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { MouseHandler, MouseEvent } from '../contexts/MouseContext.js';
export type { MouseEvent };
/**
 * A hook that listens for mouse events from stdin.
 *
 * @param onMouseEvent - The callback function to execute on each mouse event.
 * @param options - Options to control the hook's behavior.
 * @param options.isActive - Whether the hook should be actively listening for input.
 */
export declare function useMouse(onMouseEvent: MouseHandler, { isActive }: {
    isActive: boolean;
}): void;
