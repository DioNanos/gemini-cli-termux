import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { Tips } from './Tips.js';
import { describe, it, expect, vi } from 'vitest';
describe('Tips', () => {
    it.each([
        [0, '3. Create GEMINI.md files'],
        [5, '3. /help for more information'],
    ])('renders correct tips when file count is %i', (count, expectedText) => {
        const config = {
            getGeminiMdFileCount: vi.fn().mockReturnValue(count),
        };
        const { lastFrame } = render(_jsx(Tips, { config: config }));
        const output = lastFrame();
        expect(output).toContain(expectedText);
    });
});
//# sourceMappingURL=Tips.test.js.map