/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Creates a UI context object with no-op functions.
 * Useful for non-interactive environments where UI operations
 * are not applicable.
 */
export function createNonInteractiveUI() {
    return {
        addItem: (_item, _timestamp) => 0,
        clear: () => { },
        setDebugMessage: (_message) => { },
        loadHistory: (_newHistory) => { },
        pendingItem: null,
        setPendingItem: (_item) => { },
        toggleCorgiMode: () => { },
        toggleDebugProfiler: () => { },
        toggleVimEnabled: async () => false,
        reloadCommands: () => { },
        extensionsUpdateState: new Map(),
        dispatchExtensionStateUpdate: (_action) => { },
        addConfirmUpdateExtensionRequest: (_request) => { },
        removeComponent: () => { },
    };
}
//# sourceMappingURL=nonInteractiveUi.js.map