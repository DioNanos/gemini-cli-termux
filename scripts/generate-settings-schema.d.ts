/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
interface GenerateOptions {
    checkOnly: boolean;
}
export declare function generateSettingsSchema(options: GenerateOptions): Promise<void>;
export declare function main(argv?: string[]): Promise<void>;
export {};
