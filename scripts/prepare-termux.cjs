/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const os = require('node:os');
const { spawnSync } = require('node:child_process');

const isTermux =
  os.platform() === 'android' ||
  process.env.TERMUX_VERSION ||
  (process.env.PREFIX && process.env.PREFIX.includes('com.termux'));

if (isTermux) {
  process.exit(0);
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

let result = spawnSync(npmCmd, ['exec', 'husky'], {
  stdio: 'inherit',
  env: process.env,
});
if (result.status !== 0) {
  process.exit(result.status === null ? 1 : result.status);
}

result = spawnSync(npmCmd, ['run', 'bundle'], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status === null ? 1 : result.status);
