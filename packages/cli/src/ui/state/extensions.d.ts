/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ExtensionUpdateInfo } from '../../config/extension.js';
export declare enum ExtensionUpdateState {
    CHECKING_FOR_UPDATES = "checking for updates",
    UPDATED_NEEDS_RESTART = "updated, needs restart",
    UPDATED = "updated",
    UPDATING = "updating",
    UPDATE_AVAILABLE = "update available",
    UP_TO_DATE = "up to date",
    ERROR = "error",
    NOT_UPDATABLE = "not updatable",
    UNKNOWN = "unknown"
}
export interface ExtensionUpdateStatus {
    status: ExtensionUpdateState;
    notified: boolean;
}
export interface ExtensionUpdatesState {
    extensionStatuses: Map<string, ExtensionUpdateStatus>;
    batchChecksInProgress: number;
    scheduledUpdate: ScheduledUpdate | null;
}
export interface ScheduledUpdate {
    names: string[] | null;
    all: boolean;
    onCompleteCallbacks: OnCompleteUpdate[];
}
export interface ScheduleUpdateArgs {
    names: string[] | null;
    all: boolean;
    onComplete: OnCompleteUpdate;
}
type OnCompleteUpdate = (updateInfos: ExtensionUpdateInfo[]) => void;
export declare const initialExtensionUpdatesState: ExtensionUpdatesState;
export type ExtensionUpdateAction = {
    type: 'SET_STATE';
    payload: {
        name: string;
        state: ExtensionUpdateState;
    };
} | {
    type: 'SET_NOTIFIED';
    payload: {
        name: string;
        notified: boolean;
    };
} | {
    type: 'BATCH_CHECK_START';
} | {
    type: 'BATCH_CHECK_END';
} | {
    type: 'SCHEDULE_UPDATE';
    payload: ScheduleUpdateArgs;
} | {
    type: 'CLEAR_SCHEDULED_UPDATE';
} | {
    type: 'RESTARTED';
    payload: {
        name: string;
    };
};
export declare function extensionUpdatesReducer(state: ExtensionUpdatesState, action: ExtensionUpdateAction): ExtensionUpdatesState;
export {};
