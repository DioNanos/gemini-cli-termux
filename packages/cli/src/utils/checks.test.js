/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect } from 'vitest';
import { checkExhaustive, assumeExhaustive } from './checks.js';
describe('checks', () => {
    describe('checkExhaustive', () => {
        it('should throw an error with default message', () => {
            expect(() => {
                checkExhaustive('unexpected');
            }).toThrow('unexpected value unexpected!');
        });
        it('should throw an error with custom message', () => {
            expect(() => {
                checkExhaustive('unexpected', 'custom message');
            }).toThrow('custom message');
        });
    });
    describe('assumeExhaustive', () => {
        it('should do nothing', () => {
            expect(() => {
                assumeExhaustive('unexpected');
            }).not.toThrow();
        });
    });
});
//# sourceMappingURL=checks.test.js.map