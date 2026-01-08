/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TERMUX PATCH: Show helpful message on Termux install
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require('node:os');

// Detect Termux environment
const isTermux =
  os.platform() === 'android' ||
  process.env.TERMUX_VERSION ||
  (process.env.PREFIX && process.env.PREFIX.includes('com.termux'));

if (isTermux) {
  console.log('');
  console.log(
    '╔══════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '║  gemini-cli-termux installed successfully on Termux!         ║',
  );
  console.log(
    '║                                                              ║',
  );
  console.log(
    '║  PTY: @mmmbuto/node-pty-android-arm64 (no node-gyp).          ║',
  );
  console.log(
    '║  The CLI supports interactive PTY on Termux.                 ║',
  );
  console.log(
    '║                                                              ║',
  );
  console.log(
    '║  Quick start: gemini --version                               ║',
  );
  console.log(
    '║  First run:   gemini                                         ║',
  );
  console.log(
    '╚══════════════════════════════════════════════════════════════╝',
  );
  console.log('');
}
