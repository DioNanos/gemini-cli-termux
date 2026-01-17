/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { ApprovalMode } from '@google/gemini-cli-core';
import { useKeypress } from './useKeypress.js';
import { keyMatchers, Command } from '../keyMatchers.js';
import { MessageType } from '../types.js';
export function useAutoAcceptIndicator({ config, addItem, onApprovalModeChange, isActive = true, }) {
    const currentConfigValue = config.getApprovalMode();
    const [showAutoAcceptIndicator, setShowAutoAcceptIndicator] = useState(currentConfigValue);
    useEffect(() => {
        setShowAutoAcceptIndicator(currentConfigValue);
    }, [currentConfigValue]);
    useKeypress((key) => {
        let nextApprovalMode;
        if (keyMatchers[Command.TOGGLE_YOLO](key)) {
            if (config.isYoloModeDisabled() &&
                config.getApprovalMode() !== ApprovalMode.YOLO) {
                if (addItem) {
                    addItem({
                        type: MessageType.WARNING,
                        text: 'You cannot enter YOLO mode since it is disabled in your settings.',
                    }, Date.now());
                }
                return;
            }
            nextApprovalMode =
                config.getApprovalMode() === ApprovalMode.YOLO
                    ? ApprovalMode.DEFAULT
                    : ApprovalMode.YOLO;
        }
        else if (keyMatchers[Command.TOGGLE_AUTO_EDIT](key)) {
            nextApprovalMode =
                config.getApprovalMode() === ApprovalMode.AUTO_EDIT
                    ? ApprovalMode.DEFAULT
                    : ApprovalMode.AUTO_EDIT;
        }
        if (nextApprovalMode) {
            try {
                config.setApprovalMode(nextApprovalMode);
                // Update local state immediately for responsiveness
                setShowAutoAcceptIndicator(nextApprovalMode);
                // Notify the central handler about the approval mode change
                onApprovalModeChange?.(nextApprovalMode);
            }
            catch (e) {
                if (addItem) {
                    addItem({
                        type: MessageType.INFO,
                        text: e.message,
                    }, Date.now());
                }
            }
        }
    }, { isActive });
    return showAutoAcceptIndicator;
}
//# sourceMappingURL=useAutoAcceptIndicator.js.map