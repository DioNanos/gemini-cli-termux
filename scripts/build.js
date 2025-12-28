/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// npm install if node_modules was removed (e.g. via npm run clean or scripts/clean.js)
if (!existsSync(join(root, 'node_modules'))) {
  execSync('npm install', { stdio: 'inherit', cwd: root });
}

// build all workspaces/packages
execSync('npm run generate', { stdio: 'inherit', cwd: root });

const isAndroid = process.platform === 'android';
if (isAndroid) {
  // On Termux skip VSCode companion (esbuild binary mismatch) and focus core/cli/a2a/test-utils
  const workspaceDirs = [
    'packages/core',
    'packages/cli',
    'packages/test-utils',
  ];
  const workspaces = workspaceDirs.map((workspaceDir) => {
    const pkgPath = join(root, workspaceDir, 'package.json');
    try {
      const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      return pkgJson?.name || workspaceDir;
    } catch (error) {
      console.warn(
        `Could not read workspace name from ${pkgPath}, using path instead.`,
        error,
      );
      return workspaceDir;
    }
  });
  for (const ws of workspaces) {
    execSync(`npm run build --workspace ${ws}`, {
      stdio: 'inherit',
      cwd: root,
    });
  }
} else {
  execSync('npm run build --workspaces', { stdio: 'inherit', cwd: root });
}

// also build container image if sandboxing is enabled
// skip (-s) npm install + build since we did that above
try {
  execSync('node scripts/sandbox_command.js -q', {
    stdio: 'inherit',
    cwd: root,
  });
  if (
    process.env.BUILD_SANDBOX === '1' ||
    process.env.BUILD_SANDBOX === 'true'
  ) {
    execSync('node scripts/build_sandbox.js -s', {
      stdio: 'inherit',
      cwd: root,
    });
  }
} catch {
  // ignore
}
