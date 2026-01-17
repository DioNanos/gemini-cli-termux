/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { checkExhaustive } from '../../utils/checks.js';
export var ExtensionUpdateState;
(function (ExtensionUpdateState) {
    ExtensionUpdateState["CHECKING_FOR_UPDATES"] = "checking for updates";
    ExtensionUpdateState["UPDATED_NEEDS_RESTART"] = "updated, needs restart";
    ExtensionUpdateState["UPDATED"] = "updated";
    ExtensionUpdateState["UPDATING"] = "updating";
    ExtensionUpdateState["UPDATE_AVAILABLE"] = "update available";
    ExtensionUpdateState["UP_TO_DATE"] = "up to date";
    ExtensionUpdateState["ERROR"] = "error";
    ExtensionUpdateState["NOT_UPDATABLE"] = "not updatable";
    ExtensionUpdateState["UNKNOWN"] = "unknown";
})(ExtensionUpdateState || (ExtensionUpdateState = {}));
export const initialExtensionUpdatesState = {
    extensionStatuses: new Map(),
    batchChecksInProgress: 0,
    scheduledUpdate: null,
};
export function extensionUpdatesReducer(state, action) {
    switch (action.type) {
        case 'SET_STATE': {
            const existing = state.extensionStatuses.get(action.payload.name);
            if (existing?.status === action.payload.state) {
                return state;
            }
            const newStatuses = new Map(state.extensionStatuses);
            newStatuses.set(action.payload.name, {
                status: action.payload.state,
                notified: false,
            });
            return { ...state, extensionStatuses: newStatuses };
        }
        case 'SET_NOTIFIED': {
            const existing = state.extensionStatuses.get(action.payload.name);
            if (!existing || existing.notified === action.payload.notified) {
                return state;
            }
            const newStatuses = new Map(state.extensionStatuses);
            newStatuses.set(action.payload.name, {
                ...existing,
                notified: action.payload.notified,
            });
            return { ...state, extensionStatuses: newStatuses };
        }
        case 'BATCH_CHECK_START':
            return {
                ...state,
                batchChecksInProgress: state.batchChecksInProgress + 1,
            };
        case 'BATCH_CHECK_END':
            return {
                ...state,
                batchChecksInProgress: state.batchChecksInProgress - 1,
            };
        case 'SCHEDULE_UPDATE':
            return {
                ...state,
                // If there is a pre-existing scheduled update, we merge them.
                scheduledUpdate: {
                    all: state.scheduledUpdate?.all || action.payload.all,
                    names: [
                        ...(state.scheduledUpdate?.names ?? []),
                        ...(action.payload.names ?? []),
                    ],
                    onCompleteCallbacks: [
                        ...(state.scheduledUpdate?.onCompleteCallbacks ?? []),
                        action.payload.onComplete,
                    ],
                },
            };
        case 'CLEAR_SCHEDULED_UPDATE':
            return {
                ...state,
                scheduledUpdate: null,
            };
        case 'RESTARTED': {
            const existing = state.extensionStatuses.get(action.payload.name);
            if (existing?.status !== ExtensionUpdateState.UPDATED_NEEDS_RESTART) {
                return state;
            }
            const newStatuses = new Map(state.extensionStatuses);
            newStatuses.set(action.payload.name, {
                ...existing,
                status: ExtensionUpdateState.UPDATED,
            });
            return { ...state, extensionStatuses: newStatuses };
        }
        default:
            checkExhaustive(action);
    }
}
//# sourceMappingURL=extensions.js.map