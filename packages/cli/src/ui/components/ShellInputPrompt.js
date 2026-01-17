/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback } from 'react';
import { useKeypress } from '../hooks/useKeypress.js';
import { ShellExecutionService } from '@google/gemini-cli-core';
import { keyToAnsi } from '../hooks/keyToAnsi.js';
export const ShellInputPrompt = ({ activeShellPtyId, focus = true, }) => {
    const handleShellInputSubmit = useCallback((input) => {
        if (activeShellPtyId) {
            ShellExecutionService.writeToPty(activeShellPtyId, input);
        }
    }, [activeShellPtyId]);
    const handleInput = useCallback((key) => {
        if (!focus || !activeShellPtyId) {
            return;
        }
        if (key.ctrl && key.shift && key.name === 'up') {
            ShellExecutionService.scrollPty(activeShellPtyId, -1);
            return;
        }
        if (key.ctrl && key.shift && key.name === 'down') {
            ShellExecutionService.scrollPty(activeShellPtyId, 1);
            return;
        }
        const ansiSequence = keyToAnsi(key);
        if (ansiSequence) {
            handleShellInputSubmit(ansiSequence);
        }
    }, [focus, handleShellInputSubmit, activeShellPtyId]);
    useKeypress(handleInput, { isActive: focus });
    return null;
};
//# sourceMappingURL=ShellInputPrompt.js.map