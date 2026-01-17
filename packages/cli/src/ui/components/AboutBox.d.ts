/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface AboutBoxProps {
    cliVersion: string;
    osVersion: string;
    sandboxEnv: string;
    modelVersion: string;
    selectedAuthType: string;
    gcpProject: string;
    ideClient: string;
    userEmail?: string;
}
export declare const AboutBox: React.FC<AboutBoxProps>;
export {};
