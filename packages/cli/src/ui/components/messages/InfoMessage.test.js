import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../../test-utils/render.js';
import { InfoMessage } from './InfoMessage.js';
import { describe, it, expect } from 'vitest';
describe('InfoMessage', () => {
    it('renders with the correct default prefix and text', () => {
        const { lastFrame } = render(_jsx(InfoMessage, { text: "Just so you know" }));
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
    it('renders with a custom icon', () => {
        const { lastFrame } = render(_jsx(InfoMessage, { text: "Custom icon test", icon: "\u2605" }));
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
    it('renders multiline info messages', () => {
        const message = 'Info line 1\nInfo line 2';
        const { lastFrame } = render(_jsx(InfoMessage, { text: message }));
        const output = lastFrame();
        expect(output).toMatchSnapshot();
    });
});
//# sourceMappingURL=InfoMessage.test.js.map