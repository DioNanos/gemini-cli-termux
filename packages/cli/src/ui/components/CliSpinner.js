import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import Spinner from 'ink-spinner';
import { useEffect } from 'react';
import { debugState } from '../debug.js';
export const CliSpinner = (props) => {
    useEffect(() => {
        debugState.debugNumAnimatedComponents++;
        return () => {
            debugState.debugNumAnimatedComponents--;
        };
    }, []);
    return _jsx(Spinner, { ...props });
};
//# sourceMappingURL=CliSpinner.js.map