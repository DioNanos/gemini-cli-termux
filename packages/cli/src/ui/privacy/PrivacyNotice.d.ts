/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config } from '@google/gemini-cli-core';
interface PrivacyNoticeProps {
    onExit: () => void;
    config: Config;
}
export declare const PrivacyNotice: ({ onExit, config }: PrivacyNoticeProps) => import("react/jsx-runtime").JSX.Element;
export {};
