/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { FixedDeque } from 'mnemonist';
export declare const ACTION_TIMESTAMP_CAPACITY = 2048;
export declare const FRAME_TIMESTAMP_CAPACITY = 2048;
export declare const profiler: {
    profilersActive: number;
    numFrames: number;
    totalIdleFrames: number;
    totalFlickerFrames: number;
    hasLoggedFirstFlicker: boolean;
    lastFrameStartTime: number;
    openedDebugConsole: boolean;
    lastActionTimestamp: number;
    possiblyIdleFrameTimestamps: FixedDeque<number>;
    actionTimestamps: FixedDeque<number>;
    reportAction(): void;
    reportFrameRendered(): void;
    checkForIdleFrames(): void;
    registerFlickerHandler(constrainHeight: boolean): () => void;
};
export declare const DebugProfiler: () => import("react/jsx-runtime").JSX.Element | null;
