/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare function useAnimatedScrollbar(isFocused: boolean, scrollBy: (delta: number) => void): {
    scrollbarColor: string;
    flashScrollbar: () => void;
    scrollByWithAnimation: (delta: number) => void;
};
