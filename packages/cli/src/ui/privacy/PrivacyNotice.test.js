import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrivacyNotice } from './PrivacyNotice.js';
// Mock child components
vi.mock('./GeminiPrivacyNotice.js', async () => {
    const { Text } = await import('ink');
    return {
        GeminiPrivacyNotice: () => _jsx(Text, { children: "GeminiPrivacyNotice" }),
    };
});
vi.mock('./CloudPaidPrivacyNotice.js', async () => {
    const { Text } = await import('ink');
    return {
        CloudPaidPrivacyNotice: () => _jsx(Text, { children: "CloudPaidPrivacyNotice" }),
    };
});
vi.mock('./CloudFreePrivacyNotice.js', async () => {
    const { Text } = await import('ink');
    return {
        CloudFreePrivacyNotice: () => _jsx(Text, { children: "CloudFreePrivacyNotice" }),
    };
});
describe('PrivacyNotice', () => {
    const onExit = vi.fn();
    const mockConfig = {
        getContentGeneratorConfig: vi.fn(),
    };
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it.each([
        {
            authType: 'gemini-api-key',
            expectedComponent: 'GeminiPrivacyNotice',
        },
        {
            authType: 'vertex-ai',
            expectedComponent: 'CloudPaidPrivacyNotice',
        },
        {
            authType: 'oauth-personal',
            expectedComponent: 'CloudFreePrivacyNotice',
        },
        {
            authType: 'UNKNOWN',
            expectedComponent: 'CloudFreePrivacyNotice',
        },
    ])('renders $expectedComponent when authType is $authType', ({ authType, expectedComponent }) => {
        vi.mocked(mockConfig.getContentGeneratorConfig).mockReturnValue({
            authType,
        });
        const { lastFrame } = render(_jsx(PrivacyNotice, { config: mockConfig, onExit: onExit }));
        expect(lastFrame()).toContain(expectedComponent);
    });
});
//# sourceMappingURL=PrivacyNotice.test.js.map