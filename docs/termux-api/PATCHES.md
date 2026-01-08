# Patch Analysis & Improvement Proposals

**Project**: gemini-cli-termux **Version**: 0.24.6-termux **Author**: DioNanos
**Date**: 2026-01-08

---

## Executive Summary

This document analyzes the current patches of the Termux fork and proposes
improvements for installation and user experience.

---

## Current Patches

### 1. Clipboard TERMUX\_\_PREFIX

**File**: `esbuild.config.js` (lines 80-81)

```javascript
// Termux compatibility: clipboardy expects TERMUX__PREFIX but Termux sets PREFIX
if (
  process.platform === 'android' &&
  process.env.PREFIX &&
  !process.env.TERMUX__PREFIX
) {
  process.env.TERMUX__PREFIX = process.env.PREFIX;
}
```

**Purpose**: clipboardy uses `TERMUX__PREFIX` to detect Termux, but Termux sets
`PREFIX`.

**Status**: ✅ Functional

**Proposed Improvements**:

- Add `TERMUX_VERSION` check for better robustness
- Consider contributing to upstream clipboardy

---

### 2. is-in-ci Override

**File**: `packages/cli/src/patches/is-in-ci.ts`

```typescript
// This is a replacement for the `is-in-ci` package that always returns false.
// We are doing this to avoid the issue where `ink` does not render the UI
// when it detects that it is running in a CI environment.

const isInCi = false;
export default isInCi;
```

**Purpose**: Termux might be incorrectly detected as CI, disabling Ink UI.

**Status**: ✅ Functional

**Proposed Improvements**:

- Add debug log when override is active
- Better document the behavior

---

### 3. Native Modules Optional

**File**: `package.json`

```json
{
  "optionalDependencies": {
    "@mmmbuto/node-pty-android-arm64": "1.1.0"
  }
}
```

**Purpose**: Allows installation without compiling native modules.

**Status**: ✅ Functional, clean install on Termux

**Proposed Improvements**: See
[Installation Improvements](#installation-improvements)

---

### 4. Prepare Script (Termux)

**File**: `scripts/prepare-termux.cjs`

**Purpose**: Skips `husky` + `bundle` work on Termux installs.

**Status**: ✅ Functional

---

### 5. esbuild External Modules

**File**: `esbuild.config.js`

```javascript
const external = ['@mmmbuto/node-pty-android-arm64'];
```

**Purpose**: Excludes native modules from the bundle.

**Status**: ✅ Functional

---

## Installation Improvements

### Issue 1: Warning during npm install

**Symptom (before Termux-only fork)**:

```
npm warn optional SKIPPING OPTIONAL DEPENDENCY: @lydell/node-pty@1.1.0
npm warn notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for @lydell/node-pty-linux-x64
```

**Current Status**:

With `@mmmbuto/node-pty-android-arm64`, installs on Termux should be clean and
avoid node-gyp.

**Legacy Proposed Solution**:

#### A. Custom postinstall script

```javascript
// scripts/postinstall.js
const os = require('os');

if (os.platform() === 'android' || process.env.TERMUX_VERSION) {
  console.log('');
  console.log(
    '╔══════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '║  gemini-cli-termux installed successfully!                   ║',
  );
  console.log(
    '║                                                              ║',
  );
  console.log(
    '║  Note: Native module warnings above are EXPECTED on Termux.  ║',
  );
  console.log(
    '║  The CLI will work with reduced PTY functionality.           ║',
  );
  console.log(
    '║                                                              ║',
  );
  console.log(
    '║  Run: gemini --version                                       ║',
  );
  console.log(
    '╚══════════════════════════════════════════════════════════════╝',
  );
  console.log('');
}
```

**Modify package.json**:

```json
{
  "scripts": {
    "postinstall": "node scripts/postinstall.js || true"
  }
}
```

#### B. Documentation .npmrc (legacy)

Previously used to suppress optional dependency warnings. **Do not use
`optional=false` now**, because it disables the Termux PTY prebuild.

---

### Issue 2: Build from source should not require manual flags

**Symptom (before `prepare-termux`)**: `npm install` ran desktop-only prepare
steps, so users relied on `--ignore-scripts`.

**Current Status**: `prepare` is now Termux-aware, so plain `npm install` works.

**Proposed Solution**:

#### A. Improved Makefile

```makefile
# Makefile

.PHONY: install build clean termux-install

# Standard install (desktop)
install:
	npm install

# Termux-specific install
termux-install:
	@echo "Installing for Termux..."
	npm install
	npm run build
	npm run bundle
	@echo ""
	@echo "Installation complete! Run: node bundle/gemini.js"

# Build only
build:
	npm run build
	npm run bundle

# Clean
clean:
	rm -rf node_modules bundle/gemini.js
```

#### B. Helper script

**File**: `scripts/termux-setup.sh`

```bash
#!/data/data/com.termux/files/usr/bin/bash

echo "=== Gemini CLI Termux Setup ==="

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "Error: Node.js 20+ required. Install with: pkg install nodejs-lts"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build
echo "Building..."
npm run build
npm run bundle

echo ""

echo "=== Setup Complete ==="
echo "Run: node bundle/gemini.js"
echo "Or link globally: npm link"
```

---

### Issue 3: Slow first run

**Symptom**: First run of `gemini` has delay for auth/setup.

**Proposed Solution**:

#### A. Termux-aware Configuration

**File**: `packages/core/src/config/termux-defaults.ts`

```typescript
export const TERMUX_DEFAULTS = {
  // Disable PTY by default on Termux
  enableInteractiveShell: false,

  // Use file-based credential storage
  credentialStorage: 'file',

  // Reduce telemetry overhead
  telemetryEnabled: false,

  // Termux-specific paths
  configDir: process.env.HOME + '/.config/gemini',
};

export function isTermux(): boolean {
  return (
    process.platform === 'android' ||
    !!process.env.TERMUX_VERSION ||
    !!process.env.PREFIX?.includes('com.termux')
  );
}
```

---

### Issue 4: Manual updates

**Symptom**: Users must manually check for new versions.

**Proposed Solution**:

#### A. Optional Update Checker

```typescript
// packages/cli/src/utils/update-check.ts
import { getLatestVersion } from 'latest-version';

export async function checkForUpdates(currentVersion: string): Promise<void> {
  if (process.env.GEMINI_SKIP_UPDATE_CHECK) return;

  try {
    const latest = await getLatestVersion('@mmmbuto/gemini-cli-termux');
    if (latest !== currentVersion) {
      console.log(`\n📦 Update available: ${currentVersion} → ${latest}`);
      console.log('   Run: npm install -g @mmmbuto/gemini-cli-termux@latest\n');
    }
  } catch {
    // Silently fail - network may be unavailable
  }
}
```

---

## New Proposed Patches

### Patch 5: Termux-API Detection

**Purpose**: Automatically detect if Termux-API is installed.

**Implementation**:

```typescript
// packages/core/src/utils/termux-detect.ts
import { execSync } from 'child_process';

export interface TermuxEnvironment {
  isTermux: boolean;
  hasTermuxApi: boolean;
  apiVersion?: string;
  prefix: string;
}

export function detectTermuxEnvironment(): TermuxEnvironment {
  const isTermux =
    process.platform === 'android' ||
    !!process.env.TERMUX_VERSION ||
    !!process.env.PREFIX?.includes('com.termux');

  if (!isTermux) {
    return { isTermux: false, hasTermuxApi: false, prefix: '' };
  }

  let hasTermuxApi = false;
  let apiVersion: string | undefined;

  try {
    execSync('which termux-battery-status', { stdio: 'ignore' });
    hasTermuxApi = true;

    // Try to get version from package
    const result = execSync('pkg show termux-api 2>/dev/null | grep Version', {
      encoding: 'utf-8',
    });
    apiVersion = result.split(':')[1]?.trim();
  } catch {
    // termux-api not installed
  }

  return {
    isTermux: true,
    hasTermuxApi,
    apiVersion,
    prefix: process.env.PREFIX || '/data/data/com.termux/files/usr',
  };
}
```

---

### Patch 6: Suppress Harmless Warnings

**Purpose**: Hide irrelevant warnings on Termux.

**Implementation**:

```javascript
// In esbuild banner
if (process.platform === 'android') {
  // Suppress punycode deprecation warning
  const originalEmit = process.emit;
  process.emit = function (name, data, ...args) {
    if (
      name === 'warning' &&
      typeof data === 'object' &&
      data.name === 'DeprecationWarning' &&
      data.message?.includes('punycode')
    ) {
      return false;
    }
    return originalEmit.apply(process, arguments);
  };
}
```

---

### Patch 7: Graceful Fallback Messages

**Purpose**: User-friendly messages when features are unavailable.

**Implementation**:

```typescript
// packages/core/src/utils/termux-fallbacks.ts
export const TERMUX_FALLBACK_MESSAGES = {
  'node-pty': 'PTY support disabled on Termux. Using basic shell mode.',
  keytar: 'Secure keychain unavailable. Credentials stored in config file.',
  'tree-sitter-bash':
    'Bash parsing simplified. Some syntax highlighting limited.',
};

export function logFallbackOnce(module: string): void {
  const key = `GEMINI_LOGGED_${module.toUpperCase()}`;
  if (process.env[key]) return;

  const message = TERMUX_FALLBACK_MESSAGES[module];
  if (message) {
    console.log(`ℹ️  ${message}`);
    process.env[key] = '1';
  }
}
```

---

## Patch Roadmap

### Phase 1: Quick Wins (v0.22.1)

- [ ] Add postinstall script with clear message
- [ ] Create termux-setup.sh helper
- [ ] Improve Makefile

### Phase 2: Polish (v0.23.0)

- [ ] Implement Termux detection
- [ ] Add update checker
- [ ] Suppress punycode warning

### Phase 3: Integration (v0.24.0)

- [ ] Automatic Termux-API detection
- [ ] Termux-aware pre-configuration
- [ ] Graceful fallback messages

---

## Files to Modify

| File                                          | Modification              |
| --------------------------------------------- | ------------------------- |
| `package.json`                                | Add postinstall script    |
| `scripts/postinstall.js`                      | New file                  |
| `scripts/termux-setup.sh`                     | New file                  |
| `Makefile`                                    | Target termux-install     |
| `esbuild.config.js`                           | Punycode warning suppress |
| `packages/core/src/utils/termux-detect.ts`    | New file                  |
| `packages/core/src/config/termux-defaults.ts` | New file                  |

---

## Upstream Compatibility

The proposed patches are designed to:

1. **Not interfere** with desktop functionality
2. **Be conditional** (active only on Termux)
3. **Be easily removable** if upstream adds native support

---

_Author: DioNanos_
