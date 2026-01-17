/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const ESC = "\u001B";
export declare const SGR_EVENT_PREFIX = "\u001B[<";
export declare const X11_EVENT_PREFIX = "\u001B[M";
export declare const SGR_MOUSE_REGEX: RegExp;
export declare const X11_MOUSE_REGEX: RegExp;
export declare function couldBeSGRMouseSequence(buffer: string): boolean;
export declare function couldBeMouseSequence(buffer: string): boolean;
/**
 * Checks if the buffer *starts* with a complete mouse sequence.
 * Returns the length of the sequence if matched, or 0 if not.
 */
export declare function getMouseSequenceLength(buffer: string): number;
