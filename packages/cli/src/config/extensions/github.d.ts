/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ExtensionInstallMetadata, type GeminiCLIExtension } from '@google/gemini-cli-core';
import { ExtensionUpdateState } from '../../ui/state/extensions.js';
import type { ExtensionManager } from '../extension-manager.js';
/**
 * Clones a Git repository to a specified local path.
 * @param installMetadata The metadata for the extension to install.
 * @param destination The destination path to clone the repository to.
 */
export declare function cloneFromGit(installMetadata: ExtensionInstallMetadata, destination: string): Promise<void>;
export interface GithubRepoInfo {
    owner: string;
    repo: string;
}
export declare function tryParseGithubUrl(source: string): GithubRepoInfo | null;
export declare function fetchReleaseFromGithub(owner: string, repo: string, ref?: string, allowPreRelease?: boolean): Promise<GithubReleaseData | null>;
export declare function checkForExtensionUpdate(extension: GeminiCLIExtension, extensionManager: ExtensionManager): Promise<ExtensionUpdateState>;
export type GitHubDownloadResult = {
    tagName?: string;
    type: 'git' | 'github-release';
    success: false;
    failureReason: 'failed to fetch release data' | 'no release data' | 'no release asset found' | 'failed to download asset' | 'failed to extract asset' | 'unknown';
    errorMessage: string;
} | {
    tagName?: string;
    type: 'git' | 'github-release';
    success: true;
};
export declare function downloadFromGitHubRelease(installMetadata: ExtensionInstallMetadata, destination: string, githubRepoInfo: GithubRepoInfo): Promise<GitHubDownloadResult>;
interface GithubReleaseData {
    assets: Asset[];
    tag_name: string;
    tarball_url?: string;
    zipball_url?: string;
}
interface Asset {
    name: string;
    url: string;
}
export declare function findReleaseAsset(assets: Asset[]): Asset | undefined;
export interface DownloadOptions {
    headers?: Record<string, string>;
}
export declare function downloadFile(url: string, dest: string, options?: DownloadOptions, redirectCount?: number): Promise<void>;
export declare function extractFile(file: string, dest: string): Promise<void>;
export {};
