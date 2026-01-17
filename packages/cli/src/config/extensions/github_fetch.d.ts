/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare function getGitHubToken(): string | undefined;
export declare function fetchJson<T>(url: string, redirectCount?: number): Promise<T>;
