/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { getPackageJson } from './package.js';
export var ReleaseChannel;
(function (ReleaseChannel) {
    ReleaseChannel["NIGHTLY"] = "nightly";
    ReleaseChannel["PREVIEW"] = "preview";
    ReleaseChannel["STABLE"] = "stable";
})(ReleaseChannel || (ReleaseChannel = {}));
const cache = new Map();
/**
 * Clears the cache for testing purposes.
 * @private
 */
export function _clearCache() {
    cache.clear();
}
export async function getReleaseChannel(cwd) {
    if (cache.has(cwd)) {
        return cache.get(cwd);
    }
    const packageJson = await getPackageJson(cwd);
    const version = packageJson?.version ?? '';
    let channel;
    if (version.includes('nightly') || version === '') {
        channel = ReleaseChannel.NIGHTLY;
    }
    else if (version.includes('preview')) {
        channel = ReleaseChannel.PREVIEW;
    }
    else {
        channel = ReleaseChannel.STABLE;
    }
    cache.set(cwd, channel);
    return channel;
}
export async function isNightly(cwd) {
    return (await getReleaseChannel(cwd)) === ReleaseChannel.NIGHTLY;
}
export async function isPreview(cwd) {
    return (await getReleaseChannel(cwd)) === ReleaseChannel.PREVIEW;
}
export async function isStable(cwd) {
    return (await getReleaseChannel(cwd)) === ReleaseChannel.STABLE;
}
//# sourceMappingURL=channel.js.map