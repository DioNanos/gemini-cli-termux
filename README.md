# 🤖 Gemini CLI – Termux Edition

Android/Termux optimized fork of Google Gemini CLI. Installs cleanly on Termux
by skipping native modules and adding clipboard detection for Termux.

[![npm](https://img.shields.io/npm/v/@mmmbuto/gemini-cli-termux?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![downloads](https://img.shields.io/npm/dt/@mmmbuto/gemini-cli-termux?style=flat-square)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![ko-fi](https://img.shields.io/badge/☕_Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi)](https://ko-fi.com/dionanos)

---

## What This Is

**Optimized Termux edition** of `google-gemini/gemini-cli`.

This project focuses on maintaining a first-class experience for Gemini on
Android/Termux. It provides critical adaptations for the mobile environment
while tracking upstream development closely.

- **Termux-First:** Pre-configured for Android filesystem and clipboard.
- **Lightweight:** Native dependencies managed for ARM64 without complex
  compilation.
- **Up-to-Date:** Synchronized with the latest Google Gemini CLI features.

## Installation (Termux)

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts -y
npm install -g @mmmbuto/gemini-cli-termux

gemini --version  # expected: 0.24.0-termux (npm latest)
```

Build from source:

```bash
git clone https://github.com/DioNanos/gemini-cli-termux.git
cd gemini-cli-termux
npm install --ignore-optional --ignore-scripts
npm run build && npm run bundle
node bundle/gemini.js --version
```

## Termux Optimizations

- **Smart Clipboard:** Auto-detects Android environment to enable seamless
  clipboard operations (fixes `TERMUX__PREFIX`).
- **Streamlined Install:** Native PTY/keychain deps are **omitted** on Termux
  (fallback to `child_process` + file-based tokens), avoiding native builds.
- **Clean UX:** Suppresses desktop-centric warnings (like home directory checks)
  to optimize the experience for mobile terminal usage.
- **ARM64 Native:** Bundled specifically for Android architecture.

## Environment Specifics

- **Shell Integration:** Uses robust `child_process` fallback instead of
  `node-pty` for maximum stability on Android.
- **Credentials:** Keys are stored in standard config files for portability (no
  dependency on system keychains).
- **Parser:** Simplified Bash parsing to reduce heavy binary dependencies.

## Documentation & Fixes

### 📚 Complete Documentation

- **Test Results**
  - [GEMINI_TEST_REPORT_v0.22.7.md](./GEMINI_TEST_REPORT_v0.22.7.md) — testing
    channel
  - [GEMINI_TEST_REPORT_v0.22.2.md](./GEMINI_TEST_REPORT_v0.22.2.md) — stable
    baseline
- **[Test Suite](./GEMINI_TEST_SUITE.md)** - Test methodology and checklist
- **[Context Memory](./docs/cli/context-memory.md)** - Memory modes, JIT + JSON,
  and setup guide
- **[Patches & Fixes](./docs/patches/)** - Known issues and workarounds

### 🔧 Common Issues & Solutions

| Issue                 | Quick Fix                     | Documentation                                       |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| node-pty warning      | `export NODE_NO_WARNINGS=1`   | [Details](./docs/patches/node-pty-warning.md)       |
| CLI syntax (`--json`) | Use `-o json` instead         | [Details](./docs/patches/cli-syntax-differences.md) |
| Hooks commands        | Use interactive mode `/hooks` | [Details](./docs/patches/hooks-interactive-only.md) |

### 📝 Quick Reference

```bash
# Correct usage examples
gemini -o json "your prompt"              # ✅ JSON output
gemini --output-format json "prompt"      # ✅ Also works
gemini --json "prompt"                    # ❌ Wrong syntax

# Quiet mode (suppress warnings)
export NODE_NO_WARNINGS=1
gemini "your prompt"

# Hooks management (interactive only)
gemini           # Start interactive mode
/hooks           # Manage hooks
```

See [docs/patches/README.md](./docs/patches/README.md) for complete solutions.

## Updating

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
```

### Changelog (0.24.0-termux)

- **Memory Mode presets** in `/settings → Memory` (default / jit / jit+json).
- **JIT + JSON** combined memory support (ContextManager now loads JSON memory).
- **Memory settings reorganized** into a dedicated section; MCP import
  categories hidden from UI.
- **Docs & tests refreshed** for 0.24.0-termux.

## Tests

- Suite: [`GEMINI_TEST_SUITE.md`](./GEMINI_TEST_SUITE.md)
- Latest report:
  - [`GEMINI_TEST_REPORT_v0.24.0.md`](./GEMINI_TEST_REPORT_v0.24.0.md) — PASS
    (partial execution; interactive steps pending). Notes include
    non‑interactive tool confirmation limits and Termux shell parser warnings.

## Termux-API Integration

This fork supports optional integration with Termux-API commands for Android
device access. Enable Gemini to interact with your device hardware and Android
features.

## Context memory + TTS note:

- The Termux fork ships JSON context memory at
  `~/.gemini/context_memory/{base.json,user.json,user.journal.jsonl}`. In
  `/settings → Memory` you can select **Memory Mode** (default / jit / jit+json)
  and adjust Context Memory options (autoload, primary ordering, base writes).
- TTS notifications are controlled by
  `/settings → Notifications → Enable TTS Notifications`. When disabled,
  `termux-tts-speak` is blocked even if an agent asks for it. These behaviors
  are merge-safe and confined to Termux patches.

### Quick Setup

```bash
# Install Termux-API package
pkg install termux-api jq

# Copy tool discovery scripts
mkdir -p ~/.config/gemini/termux-tools
cp scripts/termux-tools/*.sh ~/.config/gemini/termux-tools/

# Configure in settings
cat > ~/.config/gemini/settings.json << 'EOF'
{
  "tool_discovery_command": "bash ~/.config/gemini/termux-tools/discovery.sh",
  "tool_call_command": "bash ~/.config/gemini/termux-tools/call.sh"
}
EOF

# Test
gemini "What's my battery status?"
```

### Supported Commands

Battery, Clipboard, Toast, Notifications, TTS, Vibrate, Torch, WiFi info,
Location, Camera, Dialog, Share, and more.

See [docs/termux-api/](./docs/termux-api/) for complete documentation.

---

## v0.22.7-termux (testing) Highlights

- **Gemini 3 Flash preview** enabled (`gemini-3-flash-preview`) with help/docs
  visibility.

- **Context Memory (default ON)**: strict, merge-safe JSON memory at
  `~/.gemini/context_memory/{base.json,user.json,user.journal.jsonl}` with
  per-source autoload, primary selector, and GEMINI.md bootstrap on first run.
- **Deterministic compaction**: journal append-only with incremental offsets,
  closed JSON schemas, key-based upsert, TTL/ephemeral guardrails,
  sensitivity=high excluded from autoload.
- **Base write toggle**: enable/disable writes to `base.json` from
  `/save_memory target=base` (off by default, merge-safe).
- **TTS toggle**: new `/settings` switch to allow/block `termux-tts-speak`;
  shell tool blocks TTS when disabled.
- **Termux-first shell**: non-interactive commands (`echo`, `pwd`, `ls`) work
  without native PTY deps; optional natives removed for faster installs.
- **Termux-API tools**: discovery/call scripts under `scripts/termux-tools/`
  expose Termux APIs as tools (battery, tts, camera, etc.).

See `docs/cli/context-memory.md` for the detailed memory layout and settings.

## v0.22.2-termux Improvements

This release includes significant improvements to the Termux experience:

### Installation

- **Clear postinstall message** - No more confusion about native module warnings
- **`make termux-install`** - One-command build from source
- **`termux-setup.sh`** - Helper script for first-time setup

### Developer Experience

- **Termux detection utility** - `isTermux()` and `detectTermuxEnvironment()`
- **Punycode warning suppression** - Cleaner output on Android
- **Merge-safe patches** - Easy to maintain after upstream sync
- **`check-termux-patches.sh`** - Verify patches after merge

### Documentation

- Complete Termux-API integration plan
- 60+ commands documented with parameters
- Merge strategy guide for maintainers

---

## Changelog (Termux)

- **0.22.1-termux**: Termux-API integration, improved installation UX, Termux
  detection utility, merge automation scripts.
- **0.22.0-termux**: Sync with upstream (0.21.0-nightly); added hide banner
  patch; restored ARM64 dependency.
- **0.21.4-termux**: (Previous)

## Upstream Tracking

- Upstream: https://github.com/google-gemini/gemini-cli
- Divergent files: `esbuild.config.js`, `docs/TERMUX.md`, `package.json`,
  `README.md`, `test-gemini/*`

## License

Apache 2.0 (same as upstream). See LICENSE.
