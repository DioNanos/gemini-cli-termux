# Execution Plan - Sonnet 4.5

**Project**: gemini-cli-termux **Author**: DioNanos **Date**: 2025-12-17
**Status**: AWAITING APPROVAL

---

## Overview

Execution plan to implement the patches and improvements described in the
documentation. To be executed with Sonnet 4.5 ONLY after approval.

**IMPORTANT**: Local changes only, NO PUSH.

---

## Prerequisites

Before starting:

```bash
cd ~/Dev/gemini-cli-termux
git status  # Verify clean state
git branch  # Verify current branch
```

---

## Task List

### PHASE 1: Installation Improvements

#### Task 1.1: Create postinstall script

**File**: `scripts/postinstall.js` **Action**: CREATE **Priority**: HIGH

```javascript
// scripts/postinstall.js
const os = require('os');

// Only show message on Termux/Android
if (
  os.platform() === 'android' ||
  process.env.TERMUX_VERSION ||
  (process.env.PREFIX && process.env.PREFIX.includes('com.termux'))
) {
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
    '║  Note: Native module warnings above are EXPECTED.            ║',
  );
  console.log(
    '║  The CLI works with reduced PTY functionality.               ║',
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
```

---

#### Task 1.2: Update package.json with postinstall

**File**: `package.json` **Action**: EDIT **Priority**: HIGH

Add in `scripts`:

```json
"postinstall": "node scripts/postinstall.js || true"
```

---

#### Task 1.3: Create termux-setup.sh helper

**File**: `scripts/termux-setup.sh` **Action**: CREATE **Priority**: MEDIUM

```bash
#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "=== Gemini CLI Termux Setup ==="
echo ""

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ required"
    echo "   Install with: pkg install nodejs-lts"
    exit 1
fi
echo "✓ Node.js version: $(node -v)"

# Check if in project directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from gemini-cli-termux root directory"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Build
echo ""
echo "Building bundle..."
npm run build 2>&1
npm run bundle 2>&1

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Run with: node bundle/gemini.js"
echo "Or link globally: npm link"
echo ""
```

---

#### Task 1.4: Update Makefile

**File**: `Makefile` **Action**: EDIT **Priority**: MEDIUM

Add target:

```makefile
# Termux-specific install and build
termux-install:
	@echo "=== Installing for Termux ==="
	npm install
	npm run build
	npm run bundle
	@echo ""
	@echo "Done! Run: node bundle/gemini.js"

termux-clean:
	rm -rf node_modules
	rm -f bundle/gemini.js

.PHONY: termux-install termux-clean
```

---

### PHASE 2: Termux Detection Utility

#### Task 2.1: Create termux-detect.ts

**File**: `packages/core/src/utils/termux-detect.ts` **Action**: CREATE
**Priority**: MEDIUM

```typescript
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'node:child_process';

export interface TermuxEnvironment {
  isTermux: boolean;
  hasTermuxApi: boolean;
  apiVersion?: string;
  prefix: string;
  availableCommands: string[];
}

/**
 * Detect if running in Termux environment
 */
export function isTermux(): boolean {
  return (
    process.platform === 'android' ||
    !!process.env.TERMUX_VERSION ||
    !!(process.env.PREFIX && process.env.PREFIX.includes('com.termux'))
  );
}

/**
 * Detect full Termux environment including API availability
 */
export function detectTermuxEnvironment(): TermuxEnvironment {
  if (!isTermux()) {
    return {
      isTermux: false,
      hasTermuxApi: false,
      prefix: '',
      availableCommands: [],
    };
  }

  let hasTermuxApi = false;
  let apiVersion: string | undefined;
  const availableCommands: string[] = [];

  try {
    // Check if termux-api is installed
    execSync('which termux-battery-status', { stdio: 'ignore' });
    hasTermuxApi = true;

    // Try to get version
    try {
      const result = execSync(
        'pkg show termux-api 2>/dev/null | grep Version || echo ""',
        { encoding: 'utf-8' },
      );
      const match = result.match(/Version:\s*(.+)/);
      if (match) {
        apiVersion = match[1].trim();
      }
    } catch {
      // Version detection failed, continue
    }

    // Detect available commands
    const commands = [
      'termux-battery-status',
      'termux-clipboard-get',
      'termux-clipboard-set',
      'termux-toast',
      'termux-notification',
      'termux-tts-speak',
      'termux-vibrate',
      'termux-torch',
      'termux-location',
      'termux-wifi-connectioninfo',
      'termux-camera-info',
      'termux-sensor',
      'termux-dialog',
    ];

    for (const cmd of commands) {
      try {
        execSync(`which ${cmd}`, { stdio: 'ignore' });
        availableCommands.push(cmd);
      } catch {
        // Command not available
      }
    }
  } catch {
    // termux-api not installed
  }

  return {
    isTermux: true,
    hasTermuxApi,
    apiVersion,
    prefix: process.env.PREFIX || '/data/data/com.termux/files/usr',
    availableCommands,
  };
}
```

---

#### Task 2.2: Export termux-detect from core index

**File**: `packages/core/src/index.ts` **Action**: EDIT **Priority**: MEDIUM

Add export:

```typescript
export * from './utils/termux-detect.js';
```

---

### PHASE 3: Punycode Warning Suppression

#### Task 3.1: Update esbuild banner

**File**: `esbuild.config.js` **Action**: EDIT **Priority**: LOW

Modify JS banner to include:

```javascript
banner: {
  js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url); globalThis.__filename = require('url').fileURLToPath(import.meta.url); globalThis.__dirname = require('path').dirname(globalThis.__filename);
// Termux compatibility: clipboardy expects TERMUX__PREFIX but Termux sets PREFIX
if (process.platform === 'android' && process.env.PREFIX && !process.env.TERMUX__PREFIX) { process.env.TERMUX__PREFIX = process.env.PREFIX; }
// Suppress punycode deprecation warning on Termux
if (process.platform === 'android') {
  const origEmit = process.emit;
  process.emit = function(name, data) {
    if (name === 'warning' && data && data.name === 'DeprecationWarning' && data.message && data.message.includes('punycode')) return false;
    return origEmit.apply(process, arguments);
  };
}`,
},
```

---

### PHASE 4: Tool Discovery Scripts (User-space)

#### Task 4.1: Create discovery.sh in scripts/termux-tools/

**File**: `scripts/termux-tools/discovery.sh` **Action**: CREATE **Priority**:
MEDIUM

(Content already defined in DISCOVERY_SETUP.md)

---

#### Task 4.2: Create call.sh in scripts/termux-tools/

**File**: `scripts/termux-tools/call.sh` **Action**: CREATE **Priority**: MEDIUM

(Content already defined in DISCOVERY_SETUP.md)

---

### PHASE 5: Documentation

#### Task 5.1: Update main README.md

**File**: `README.md` **Action**: EDIT **Priority**: HIGH

Add Termux-API section:

```markdown
## Termux-API Integration (New!)

This fork supports integration with Termux-API commands for Android device
access.

See [docs/termux-api/](./docs/termux-api/) for:

- Integration plan and architecture
- Complete command reference
- Tool discovery setup guide
- Patch documentation
```

---

#### Task 5.2: Update docs/TERMUX.md

**File**: `docs/TERMUX.md` **Action**: EDIT **Priority**: MEDIUM

Add Termux-API section:

````markdown
## Termux-API Support (Optional)

Enable access to Android hardware and APIs:

1. Install Termux-API package:
   ```bash
   pkg install termux-api jq
   ```
````

2. Install Termux:API app from F-Droid

3. Setup tool discovery (optional):

   ```bash
   # Copy scripts to config
   mkdir -p ~/.config/gemini/termux-tools
   cp scripts/termux-tools/*.sh ~/.config/gemini/termux-tools/
   chmod +x ~/.config/gemini/termux-tools/*.sh

   # Configure in settings.json
   echo '{"tool_discovery_command": "bash ~/.config/gemini/termux-tools/discovery.sh", "tool_call_command": "bash ~/.config/gemini/termux-tools/call.sh"}' > ~/.config/gemini/settings.json
   ```

4. Test:
   ```bash
   gemini "What's my battery status?"
   ```

See [docs/termux-api/](./docs/termux-api/) for complete documentation.

````

---

#### Task 5.3: Update docs/patches/README.md
**File**: `docs/patches/README.md`
**Action**: EDIT
**Priority**: LOW

Update version and add new patches:
```markdown
# Termux Patches (0.22.0-termux)

Minimal changes to run `gemini-cli` on Android/Termux ARM64 without native deps.

## Patch List

1. **Clipboard (TERMUX__PREFIX)** – On Termux set `TERMUX__PREFIX` from
   `$PREFIX` so clipboardy detects Termux correctly.
2. **Optional native modules** – Leave `node-pty`, `keytar`, `tree-sitter-bash`
   in `optionalDependencies`; build failures are tolerated.
3. **Core exports** – `packages/core/src/index.ts` re-exports stdio utilities.
4. **Bundle** – Prebuilt `bundle/gemini.js` shipped in npm package.
5. **is-in-ci override** – Prevents ink from detecting Termux as CI.
6. **Punycode warning** – Suppresses deprecation warning on Termux.
7. **Termux detection** – `packages/core/src/utils/termux-detect.ts` utility.
8. **Postinstall message** – Clear success message on Termux install.

## New in 0.22.0

- Termux-API tool discovery support
- Improved installation experience
- Helper scripts for build from source

**Version**: 0.22.0-termux
````

---

## Execution Order

```
PHASE 1 (Installation) - High Priority
├── 1.1 scripts/postinstall.js [CREATE]
├── 1.2 package.json [EDIT - postinstall]
├── 1.3 scripts/termux-setup.sh [CREATE]
└── 1.4 Makefile [EDIT - termux targets]

PHASE 2 (Detection) - Medium Priority
├── 2.1 packages/core/src/utils/termux-detect.ts [CREATE]
└── 2.2 packages/core/src/index.ts [EDIT - export]

PHASE 3 (Warning) - Low Priority
└── 3.1 esbuild.config.js [EDIT - banner]

PHASE 4 (Discovery Scripts) - Medium Priority
├── 4.1 scripts/termux-tools/discovery.sh [CREATE]
└── 4.2 scripts/termux-tools/call.sh [CREATE]

PHASE 5 (Docs) - High Priority
├── 5.1 README.md [EDIT]
├── 5.2 docs/TERMUX.md [EDIT]
└── 5.3 docs/patches/README.md [EDIT]
```

---

## Post-Execution Verification

```bash
# 1. Build test
npm install
npm run build
npm run bundle

# 2. Version check
node bundle/gemini.js --version

# 3. Termux detection (if on Termux)
node -e "const {isTermux} = require('./packages/core/dist/utils/termux-detect.js'); console.log('isTermux:', isTermux())"

# 4. Discovery test (if configured)
bash scripts/termux-tools/discovery.sh | jq '.[] | .name' | head -5

# 5. Git status (NO PUSH)
git status
git diff --stat
```

---

## Commit Message (when approved)

```
feat(termux): improve installation and add Termux-API support

- Add postinstall script with clear success message for Termux
- Add termux-setup.sh helper for build from source
- Add Makefile targets for Termux install
- Add termux-detect.ts utility for environment detection
- Add punycode warning suppression on Android
- Add Tool Discovery scripts for Termux-API integration
- Update documentation

Fixes #XX
```

---

### PHASE 6: Merge Automation

#### Task 6.1: Create check-termux-patches.sh

**File**: `scripts/check-termux-patches.sh` **Action**: CREATE **Priority**:
HIGH

Script to verify that all patches are intact after upstream merge. (See
MERGE_STRATEGY.md for complete content)

---

## Notes for Sonnet 4.5

1. Execute tasks in PHASE order
2. Verify build after each PHASE
3. DO NOT execute git push
4. Report any compilation errors
5. All TypeScript files must pass typecheck
6. All patches must be easily re-applicable after upstream sync
7. Use `// TERMUX PATCH:` comments to identify modifications

---

**STATUS**: Awaiting DAG approval

_Author: DioNanos_
