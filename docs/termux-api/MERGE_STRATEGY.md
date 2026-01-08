# Merge Strategy - Upstream Sync

**Project**: gemini-cli-termux  
**Author**: DioNanos  
**Last updated**: 2026-01-08  
**Scope**: Version-agnostic strategy for maintaining all Termux patches

---

## Overview

Strategy for keeping Termux patches merge-safe and easy to re-apply after each
sync with upstream `google-gemini/gemini-cli`.

---

## Design Principles

### 1. Patch Isolation

All Termux modifications must be:

- **Isolated** in separate files when possible
- **Conditional** (`if (isTermux())`)
- **Additive** rather than modifying existing code
- **Documented** with `// TERMUX PATCH:` comments

### 2. File Strategy

| Type             | Approach   | Merge Conflicts |
| ---------------- | ---------- | --------------- |
| **New files**    | Preferred  | None            |
| **Minimal edit** | Acceptable | Rare            |
| **Refactor**     | Avoid      | Frequent        |

### 3. Patch-Friendly Structure

```
gemini-cli-termux/
├── packages/core/src/
│   ├── utils/termux-detect.ts        # NEW - no conflicts
│   ├── utils/contextMemory.ts        # NEW - JSON memory + journal
│   ├── services/contextManager.ts    # EDIT - JIT + JSON wiring
│   └── tools/shell.ts                # EDIT - TTS guard
├── packages/cli/src/config/
│   ├── settingsSchema.ts             # EDIT - Memory Mode settings
│   └── config.ts                     # EDIT - Memory Mode logic
├── scripts/
│   ├── postinstall.cjs               # NEW - no conflicts
│   ├── termux-setup.sh               # NEW - no conflicts
│   ├── termux-tools/                 # NEW - no conflicts
│   └── check-termux-patches.sh       # NEW - verification script
├── esbuild.config.js                 # EDIT - banner (polyfills + Termux)
├── package.json                      # EDIT - postinstall + Termux config
└── README.md                          # EDIT - Termux docs
```

---

## Upstream Merge Procedure

### Step 1: Fetch upstream

```bash
cd ~/Dev/gemini-cli-termux
git remote add upstream https://github.com/google-gemini/gemini-cli.git 2>/dev/null || true
git fetch upstream
```

### Step 2: Create merge branch

```bash
git checkout -b merge-upstream-vX.Y.Z
git merge upstream/main --no-commit
```

### Step 3: Resolve conflicts (if any)

Likely conflict files:

- `package.json` - Resolve by keeping our scripts
- `esbuild.config.js` - Resolve by keeping our banner
- `packages/core/src/index.ts` - Resolve by keeping our exports
- `packages/cli/src/config/settingsSchema.ts` - Keep Memory Mode settings
- `packages/cli/src/config/config.ts` - Keep Memory Mode mapping logic
- `packages/core/src/services/contextManager.ts` - Keep JIT + JSON wiring
- `packages/core/src/utils/contextMemory.ts` - Keep JSON memory logic
- `packages/core/src/tools/shell.ts` - Keep TTS guard
- `packages/core/package.json` - Keep `@mmmbuto/node-pty-android-arm64` and
  remove `@lydell/node-pty-*`/`node-pty`
- `packages/core/src/types/pty-shim.d.ts` - Keep Termux PTY typings shim
- `packages/core/src/types/mcp-sdk-shims.d.ts` - Keep MCP SDK typings shim
- `scripts/prepare-termux.cjs` - Keep Termux prepare no-op

### Step 4: Verify patches intact

```bash
# Check that our files still exist
ls -la packages/core/src/utils/termux-detect.ts
ls -la packages/core/src/utils/contextMemory.ts
ls -la scripts/postinstall.cjs
ls -la scripts/termux-setup.sh
ls -la scripts/termux-tools/
ls -la packages/core/src/types/pty-shim.d.ts
ls -la packages/core/src/types/mcp-sdk-shims.d.ts

# Check that modifications are present
grep "TERMUX PATCH" esbuild.config.js
grep "postinstall" package.json
grep "@mmmbuto/node-pty-android-arm64" packages/core/package.json
ls -la scripts/prepare-termux.cjs
grep "termux-detect" packages/core/src/index.ts
grep "memory.mode" packages/cli/src/config/settingsSchema.ts
```

### Step 5: Build test

```bash
npm install
npm run build
npm run bundle
node bundle/gemini.js --version
```

### Step 6: Commit merge

```bash
git add .
git commit -m "merge: upstream vX.Y.Z + Termux patches"
```

---

## Common Conflicts and Solutions

### package.json

**Typical conflict**: `scripts` section modified upstream

**Solution**:

```json
{
  "scripts": {
    // ... upstream scripts ...
    "postinstall": "node scripts/postinstall.cjs || true" // TERMUX PATCH
  }
}
```

### esbuild.config.js

**Typical conflict**: `banner` modified upstream

**Solution**: Keep our banner with comment

```javascript
banner: {
  js: `/* UPSTREAM BANNER */
// TERMUX PATCH START
// Base64 polyfill for web-tree-sitter (Node 22/24)
if (typeof Uint8Array.fromBase64 !== 'function') { /* ... */ }
if (typeof Uint8Array.prototype.toBase64 !== 'function') { /* ... */ }
// Clipboardy Termux detection
if (process.platform === 'android' && process.env.PREFIX && !process.env.TERMUX__PREFIX) {
  process.env.TERMUX__PREFIX = process.env.PREFIX;
}
// Punycode deprecation warning suppression
if (process.platform === 'android') { /* ... */ }
// TERMUX PATCH END
`,
},
```

### packages/core/src/index.ts

**Typical conflict**: Exports added/modified upstream

**Solution**: Add our export at the end

```typescript
// ... upstream exports ...

// TERMUX PATCH
export * from './utils/termux-detect.js';
```

### Context memory + Memory Mode

- `packages/core/src/utils/contextMemory.ts` implements JSON memories and
  journal compaction.
- `packages/core/src/services/contextManager.ts` wires JIT + JSON.
- `packages/cli/src/config/settingsSchema.ts` + `config.ts` add Memory Mode
  settings and mapping logic.

### Shell / TTS guard

- `packages/core/src/tools/shell.ts` contains a guard to block
  `termux-tts-speak` when `notifications.ttsEnabled` is false. Re-apply after
  merges if the shell tool changes.

---

## Merge Check Automation

### Post-merge verification script

**File**: `scripts/check-termux-patches.sh`

```bash
#!/bin/bash
# Verify that Termux patches are intact after a merge

set -e

echo "=== Checking Termux Patches ==="

ERRORS=0

# Check file existence
FILES=(
  "packages/core/src/utils/termux-detect.ts"
  "scripts/postinstall.cjs"
  "scripts/termux-setup.sh"
  "scripts/termux-tools/discovery.sh"
  "scripts/termux-tools/call.sh"
  "scripts/check-termux-patches.sh"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "✓ $f exists"
  else
    echo "✗ $f MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check key contents
if grep -q "TERMUX PATCH" esbuild.config.js; then
  echo "✓ esbuild.config.js has TERMUX patches"
else
  echo "✗ esbuild.config.js MISSING TERMUX patch"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "postinstall" package.json; then
  echo "✓ package.json has postinstall"
else
  echo "✗ package.json MISSING postinstall"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "termux-detect" packages/core/src/index.ts; then
  echo "✓ core/index.ts has termux-detect export"
else
  echo "✗ core/index.ts MISSING termux-detect export"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "termux-install" Makefile; then
  echo "✓ Makefile has termux-install target"
else
  echo "✗ Makefile MISSING termux-install target"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "=== All patches intact ==="
  exit 0
else
  echo "=== $ERRORS patches missing/broken ==="
  exit 1
fi
```

### Git Hook (optional)

**File**: `.husky/post-merge`

```bash
#!/bin/bash
bash scripts/check-termux-patches.sh || echo "WARNING: Termux patches need attention!"
```

---

## Tracking Upstream Changes

### Files to monitor

| Upstream File                                  | Impact | Action                      |
| ---------------------------------------------- | ------ | --------------------------- |
| `esbuild.config.js`                            | High   | Verify banner patches       |
| `package.json`                                 | High   | Verify postinstall + config |
| `packages/cli/src/config/settingsSchema.ts`    | High   | Memory Mode settings        |
| `packages/core/src/services/contextManager.ts` | High   | JIT + JSON wiring           |
| `packages/core/src/utils/contextMemory.ts`     | High   | JSON memory logic           |
| `packages/core/src/tools/shell.ts`             | Medium | TTS guard                   |
| `packages/core/src/index.ts`                   | Medium | termux-detect export        |
| `scripts/termux-tools/*`                       | Low    | Termux-API tools            |

### Changelog Tracking

Keep note of integrated upstream versions (update as you merge):

```
docs/termux-api/UPSTREAM_TRACKING.md
```

```markdown
# Upstream Tracking

| Version        | Date       | Notes                           |
| -------------- | ---------- | ------------------------------- |
| 0.21.0-nightly | 2025-12-12 | Initial fork base               |
| 0.22.0-nightly | 2025-12-17 | Synced, patches ok              |
| 0.24.0-nightly | 2025-12-27 | Synced, Memory Mode + shell fix |
```

---

## Minimizing Future Conflicts

### DO

- ✅ Create new files instead of modifying existing ones
- ✅ Use wrapper functions instead of modifying existing ones
- ✅ Add to the end of files instead of the middle
- ✅ Use `// TERMUX PATCH` comments to identify modifications
- ✅ Keep changes atomic and isolated

### DON'T

- ❌ Rename upstream variables/functions
- ❌ Restructure upstream code
- ❌ Modify existing core logic
- ❌ Add dependencies that require native build
- ❌ Remove upstream code (only add conditionals)

---

## Recovery from Failed Merge

If a merge creates too many conflicts:

```bash
# Abort merge
git merge --abort

# Cherry-pick our commits instead
git log --oneline | head -20  # Find Termux commits
git checkout -b manual-merge upstream/main
git cherry-pick <commit1> <commit2> ...

# Or re-apply patch manually
git diff main~5..main > termux-patches.diff
git checkout upstream/main
git apply termux-patches.diff
```

---

_Author: DioNanos_
