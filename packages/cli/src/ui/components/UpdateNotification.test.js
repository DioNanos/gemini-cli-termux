import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { UpdateNotification } from './UpdateNotification.js';
import { describe, it, expect } from 'vitest';
describe('UpdateNotification', () => {
    it('renders message', () => {
        const { lastFrame } = render(_jsx(UpdateNotification, { message: "Update available!" }));
        expect(lastFrame()).toContain('Update available!');
    });
});
//# sourceMappingURL=UpdateNotification.test.js.map