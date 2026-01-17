/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const LOCAL_DEV_SANDBOX_IMAGE_NAME = "gemini-cli-sandbox";
export declare const SANDBOX_NETWORK_NAME = "gemini-cli-sandbox";
export declare const SANDBOX_PROXY_NAME = "gemini-cli-sandbox-proxy";
export declare const BUILTIN_SEATBELT_PROFILES: string[];
export declare function getContainerPath(hostPath: string): string;
export declare function shouldUseCurrentUserInSandbox(): Promise<boolean>;
export declare function parseImageName(image: string): string;
export declare function ports(): string[];
export declare function entrypoint(workdir: string, cliArgs: string[]): string[];
