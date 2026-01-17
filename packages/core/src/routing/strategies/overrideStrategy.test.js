/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect } from 'vitest';
import { OverrideStrategy } from './overrideStrategy.js';
import { DEFAULT_GEMINI_MODEL_AUTO } from '../../config/models.js';
describe('OverrideStrategy', () => {
    const strategy = new OverrideStrategy();
    const mockContext = {};
    const mockClient = {};
    it('should return null when the override model is auto', async () => {
        const mockConfig = {
            getModel: () => DEFAULT_GEMINI_MODEL_AUTO,
            getPreviewFeatures: () => false,
        };
        const decision = await strategy.route(mockContext, mockConfig, mockClient);
        expect(decision).toBeNull();
    });
    it('should return a decision with the override model when one is specified', async () => {
        const overrideModel = 'gemini-2.5-pro-custom';
        const mockConfig = {
            getModel: () => overrideModel,
            getPreviewFeatures: () => false,
        };
        const decision = await strategy.route(mockContext, mockConfig, mockClient);
        expect(decision).not.toBeNull();
        expect(decision?.model).toBe(overrideModel);
        expect(decision?.metadata.source).toBe('override');
        expect(decision?.metadata.reasoning).toContain('Routing bypassed by forced model directive');
        expect(decision?.metadata.reasoning).toContain(overrideModel);
    });
    it('should handle different override model names', async () => {
        const overrideModel = 'gemini-2.5-flash-experimental';
        const mockConfig = {
            getModel: () => overrideModel,
            getPreviewFeatures: () => false,
        };
        const decision = await strategy.route(mockContext, mockConfig, mockClient);
        expect(decision).not.toBeNull();
        expect(decision?.model).toBe(overrideModel);
    });
    it('should respect requestedModel from context', async () => {
        const requestedModel = 'requested-model';
        const configModel = 'config-model';
        const mockConfig = {
            getModel: () => configModel,
            getPreviewFeatures: () => false,
        };
        const contextWithRequestedModel = {
            requestedModel,
        };
        const decision = await strategy.route(contextWithRequestedModel, mockConfig, mockClient);
        expect(decision).not.toBeNull();
        expect(decision?.model).toBe(requestedModel);
    });
});
//# sourceMappingURL=overrideStrategy.test.js.map