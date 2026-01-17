/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@google/gemini-cli-core';
interface BannerData {
    defaultText: string;
    warningText: string;
}
export declare function useBanner(bannerData: BannerData, config: Config): {
    bannerText: string;
};
export {};
