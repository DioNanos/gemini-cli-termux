/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TERMUX PATCH: Show helpful message on Termux install
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const PTY_UTILS_PACKAGE = '@mmmbuto/pty-termux-utils';
const PTY_NATIVE_PACKAGE = '@mmmbuto/node-pty-android-arm64';
const PTY_NATIVE_VERSION = '~1.1.0';

// Detect Termux environment
const isTermux =
  os.platform() === 'android' ||
  process.env.TERMUX_VERSION ||
  (process.env.PREFIX && process.env.PREFIX.includes('com.termux'));

function resolveFromPaths(moduleName, paths) {
  try {
    return require.resolve(moduleName, { paths });
  } catch {
    return null;
  }
}

function findPackageRoot(resolvedEntry, expectedPackageName) {
  let current = path.dirname(resolvedEntry);
  while (current && current !== path.dirname(current)) {
    const pkgPath = path.join(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg?.name === expectedPackageName) {
          return current;
        }
      } catch {
        // continue searching upward
      }
    }
    current = path.dirname(current);
  }
  return null;
}

function ensureTermuxPtyDependency() {
  const ptyUtilsEntry = resolveFromPaths(PTY_UTILS_PACKAGE, [
    process.cwd(),
    __dirname,
  ]);
  if (!ptyUtilsEntry) {
    console.warn(
      `[termux] Could not resolve ${PTY_UTILS_PACKAGE}. Skipping PTY dependency self-heal.`,
    );
    return;
  }

  const ptyUtilsDir = findPackageRoot(ptyUtilsEntry, PTY_UTILS_PACKAGE);
  if (!ptyUtilsDir) {
    console.warn(
      `[termux] Could not find package root for ${PTY_UTILS_PACKAGE}. Skipping PTY dependency self-heal.`,
    );
    return;
  }

  const existingNativePty = resolveFromPaths(PTY_NATIVE_PACKAGE, [ptyUtilsDir]);
  if (existingNativePty) {
    console.log(`[termux] PTY dependency detected: ${PTY_NATIVE_PACKAGE}`);
    return;
  }

  console.warn(
    `[termux] Missing ${PTY_NATIVE_PACKAGE} required by @mmmbuto/pty-termux-utils.`,
  );
  console.log('[termux] Attempting PTY dependency repair...');

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const installTarget = `${PTY_NATIVE_PACKAGE}@${PTY_NATIVE_VERSION}`;
  const installResult = spawnSync(
    npmCmd,
    ['install', '--no-save', '--ignore-scripts', '--no-package-lock', installTarget],
    {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
    },
  );

  if ((installResult.status ?? 1) !== 0) {
    console.warn(
      `[termux] PTY dependency auto-repair failed. Install manually: npm install -g ${installTarget}`,
    );
    return;
  }

  const repairedNativePty = resolveFromPaths(PTY_NATIVE_PACKAGE, [
    ptyUtilsDir,
    process.cwd(),
  ]);
  if (!repairedNativePty) {
    console.warn(
      `[termux] PTY dependency still missing after repair. Install manually: npm install -g ${installTarget}`,
    );
    return;
  }

  console.log(`[termux] PTY dependency repaired: ${PTY_NATIVE_PACKAGE}`);
}

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

  ensureTermuxPtyDependency();
}
