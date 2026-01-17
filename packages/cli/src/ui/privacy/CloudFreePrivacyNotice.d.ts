/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
interface CloudFreePrivacyNoticeProps {
    config: Config;
    onExit: () => void;
}
export declare const CloudFreePrivacyNotice: ({ config, onExit, }: CloudFreePrivacyNoticeProps) => import("react/jsx-runtime").JSX.Element;
export {};
