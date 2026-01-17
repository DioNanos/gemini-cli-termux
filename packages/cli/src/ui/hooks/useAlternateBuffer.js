/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSettings } from '../contexts/SettingsContext.js';
export const isAlternateBufferEnabled = (settings) => settings.merged.ui.useAlternateBuffer === true;
export const useAlternateBuffer = () => {
    const settings = useSettings();
    return isAlternateBufferEnabled(settings);
};
//# sourceMappingURL=useAlternateBuffer.js.map