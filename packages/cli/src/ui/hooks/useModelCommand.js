/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback } from 'react';
export const useModelCommand = () => {
    const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
    const openModelDialog = useCallback(() => {
        setIsModelDialogOpen(true);
    }, []);
    const closeModelDialog = useCallback(() => {
        setIsModelDialogOpen(false);
    }, []);
    return {
        isModelDialogOpen,
        openModelDialog,
        closeModelDialog,
    };
};
//# sourceMappingURL=useModelCommand.js.map