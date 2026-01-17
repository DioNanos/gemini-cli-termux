/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
export function useTerminalSize() {
    const [size, setSize] = useState({
        columns: process.stdout.columns || 60,
        rows: process.stdout.rows || 20,
    });
    useEffect(() => {
        function updateSize() {
            setSize({
                columns: process.stdout.columns || 60,
                rows: process.stdout.rows || 20,
            });
        }
        process.stdout.on('resize', updateSize);
        return () => {
            process.stdout.off('resize', updateSize);
        };
    }, []);
    return size;
}
//# sourceMappingURL=useTerminalSize.js.map