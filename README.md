# 🤖 Gemini CLI – Termux Edition

Android/Termux optimized fork of Google Gemini CLI. Installs cleanly on Termux
with a native ARM64 PTY prebuild and clipboard detection for Termux.

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

gemini --version  # expected: 0.24.6-termux (npm latest)
```

Build from source:

```bash
git clone https://github.com/DioNanos/gemini-cli-termux.git
cd gemini-cli-termux
npm install
npm run build && npm run bundle
node bundle/gemini.js --version
```

## Termux Optimizations

- **Smart Clipboard:** Auto-detects Android environment to enable seamless
  clipboard operations (fixes `TERMUX__PREFIX`).
- **Streamlined Install:** Uses `@mmmbuto/node-pty-android-arm64` prebuild (no
  node-gyp) and file-based tokens instead of keychain.
- **Clean UX:** Suppresses desktop-centric warnings (like home directory checks)
  to optimize the experience for mobile terminal usage.
- **ARM64 Native:** Bundled specifically for Android architecture.

## Environment Specifics

- **Shell Integration:** Uses `@mmmbuto/node-pty-android-arm64` on Termux for
  interactive PTY support (falls back to `child_process` if unavailable).
- **Credentials:** Keys are stored in standard config files for portability (no
  dependency on system keychains).
- **Parser:** Simplified Bash parsing to reduce heavy binary dependencies.

## Documentation & Fixes

### 📚 Complete Documentation

- **Test Results**
  - [GEMINI_TEST_REPORT_v0.24.6.md](./GEMINI_TEST_REPORT_v0.24.6.md) — PARTIAL
    (latest report; 0.24.6-termux)
- **[Test Suite](./GEMINI_TEST_SUITE.md)** - Test methodology and checklist
- **[Context Memory](./docs/cli/context-memory.md)** - Memory modes, JIT + JSON,
  and setup guide
- **[Patches & Fixes](./docs/patches/)** - Known issues and workarounds

### 🔧 Common Issues & Solutions

| Issue                 | Quick Fix                     | Documentation                                       |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| CLI syntax (`--json`) | Use `-o json` instead         | [Details](./docs/patches/cli-syntax-differences.md) |
| Hooks commands        | Use interactive mode `/hooks` | [Details](./docs/patches/hooks-interactive-only.md) |

### 📝 Quick Reference

```bash
# Correct usage examples
gemini -o json "your prompt"              # ✅ JSON output
gemini --output-format json "prompt"      # ✅ Also works
gemini --json "prompt"                    # ❌ Wrong syntax

# Hooks management (interactive only)
gemini           # Start interactive mode
/hooks           # Manage hooks
```

See [docs/patches/README.md](./docs/patches/README.md) for complete solutions.

## Updating

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
```

### Changelog (0.24.6-termux)

- **PTY on Termux**: Uses `@mmmbuto/node-pty-android-arm64` prebuild.
- **Deps cleanup**: Removed `@lydell/node-pty-*` and generic `node-pty`.
- **Docs**: Updated Termux notes for PTY support.

## Tests

- Suite: [`GEMINI_TEST_SUITE.md`](./GEMINI_TEST_SUITE.md)
- Latest report:
  - [`GEMINI_TEST_REPORT_v0.24.6.md`](./GEMINI_TEST_REPORT_v0.24.6.md) — PARTIAL
    (latest report; 0.24.6-termux latest). Notes include non‑interactive tool
    confirmation limits.

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

## Upstream Tracking

- Upstream: https://github.com/google-gemini/gemini-cli
- Divergent files: `esbuild.config.js`, `docs/TERMUX.md`, `package.json`,
  `README.md`, `test-gemini/*`

## License

Apache 2.0 (same as upstream). See LICENSE.

## PTY Support (Shared Library)

This project uses `@mmmbuto/pty-termux-utils` as a shared library for PTY
management across all Termux CLI projects (Gemini, Qwen, Nexus).

- **Native PTY:** Uses `@mmmbuto/node-pty-android-arm64@~1.1.0` when available
- **Fallback:** Gracefully degrades to `child_process` adapter
- **Debug Logging:** Enable with `PTY_DEBUG=1` environment variable
- **Architecture:** See `@mmmbuto/pty-termux-utils` documentation

```bash
# Enable PTY debug logging
PTY_DEBUG=1 gemini "your prompt"
```
