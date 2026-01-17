/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ReactNode } from 'react';
export declare function getFormattedBannerContent(rawText: string, isWarning: boolean, subsequentLineColor: string): ReactNode;
interface BannerProps {
    bannerText: string;
    isWarning: boolean;
    width: number;
}
export declare const Banner: ({ bannerText, isWarning, width }: BannerProps) => import("react/jsx-runtime").JSX.Element;
export {};
