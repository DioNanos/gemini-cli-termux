import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..');

const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

function runNode(args, extraEnv = {}) {
  return execFileSync('node', args, {
    cwd: repoRoot,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  });
}

// 1) version
const versionOut = runNode(['bundle/gemini.js', '--version']).trim();
assert.equal(versionOut, pkg.version, `expected version ${pkg.version}, got ${versionOut}`);

// 2) help output
const helpOut = runNode(['bundle/gemini.js', '--help']);
assert(helpOut.toLowerCase().includes('gemini'), 'help output should mention gemini');

// 3) Termux clipboard patch present
const bundleSrc = readFileSync(path.join(repoRoot, 'bundle', 'gemini.js'), 'utf8');
assert(
  bundleSrc.includes('TERMUX__PREFIX') && bundleSrc.includes('PREFIX'),
  'bundle must include TERMUX__PREFIX patch'
);

console.log('smoke: all checks passed');
