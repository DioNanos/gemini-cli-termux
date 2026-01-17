/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const PHRASE_CHANGE_INTERVAL_MS = 15000;
export declare const INTERACTIVE_SHELL_WAITING_PHRASE = "Interactive shell awaiting input... press tab to focus shell";
/**
 * Custom hook to manage cycling through loading phrases.
 * @param isActive Whether the phrase cycling should be active.
 * @param isWaiting Whether to show a specific waiting phrase.
 * @param isInteractiveShellWaiting Whether an interactive shell is waiting for input but not focused.
 * @param customPhrases Optional list of custom phrases to use.
 * @returns The current loading phrase.
 */
export declare const usePhraseCycler: (isActive: boolean, isWaiting: boolean, isInteractiveShellWaiting: boolean, lastOutputTime?: number, customPhrases?: string[]) => string;
