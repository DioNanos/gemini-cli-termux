# 🤖 Gemini CLI – Termux Edition

Android/Termux compatible fork of Google Gemini CLI. Installs cleanly on Termux
by skipping native modules and adding clipboard detection for Termux.

[![npm](https://img.shields.io/npm/v/@mmmbuto/gemini-cli-termux?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![downloads](https://img.shields.io/npm/dt/@mmmbuto/gemini-cli-termux?style=flat-square)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![ko-fi](https://img.shields.io/badge/☕_Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi)](https://ko-fi.com/dionanos)

---

## What This Is

Temporary compatibility fork of `google-gemini/gemini-cli` for Android Termux.

- Tracks upstream regularly.
- Minimal patches only: Termux clipboard env fix, native modules marked
  optional, PTY auto-disabled on Termux (fallback to child_process).
- Bundled for ARM64/Android.
- Sunset: once upstream adds Termux support, migrate back to
  `@google/gemini-cli`.

## Installation (Termux)

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts -y
npm install -g @mmmbuto/gemini-cli-termux

gemini --version  # expected: 0.21.4-termux (latest)
```

Build from source:

```bash
git clone https://github.com/DioNanos/gemini-cli-termux.git
cd gemini-cli-termux
npm install --ignore-optional --ignore-scripts
npm run build && npm run bundle
node bundle/gemini.js --version
```

## Patches

- Clipboardy: sets `TERMUX__PREFIX` from `PREFIX` on Android.
- Native modules (`keytar`, `node-pty`, `tree-sitter-bash`) kept optional;
  install with `--ignore-optional --ignore-scripts`.

## Known Limitations on Termux

- No PTY (node-pty fails to build) → limited shell integration.
- No secure keychain → credentials stored in plain config files.
- Bash parsing without tree-sitter.

## Documentation & Fixes

### 📚 Complete Documentation

- **[Test Results](./GEMINI_TEST_REPORT_v0.21.3.md)** - Comprehensive test
  report with analysis
- **[Test Suite](./GEMINI_TEST_SUITE.md)** - Test methodology and checklist
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

### Versions

- **latest**: 0.21.4-termux (this build)
- **stable**: 0.21.4-termux

## Tests

- Suite: [`GEMINI_TEST_SUITE.md`](./GEMINI_TEST_SUITE.md)
- Latest report:
  [`GEMINI_TEST_REPORT_v0.21.3.md`](./GEMINI_TEST_REPORT_v0.21.3.md)
  - PASS with warnings (node-pty optional missing log; `--version --json`
    outputs plain string; config-path flag unsupported; extensions settings
    needs subcommand).
  - Non-interactive/file tests executed via agent; Termux checks pass;
    package/bundle verified.
  - Optional native modules (node-pty, keytar, tree-sitter-bash) not built on
    Termux → warnings expected; CLI remains functional.

## Changelog (Termux)

- **0.21.2-termux** (latest/stable): upstream main sync; Termux patches
  retained; bundle export fix for `createInkStdio`; tests pending refresh.

## Upstream Tracking

- Upstream: https://github.com/google-gemini/gemini-cli
- Divergent files: `esbuild.config.js`, `docs/TERMUX.md`, `package.json`,
  `README.md`, `test-gemini/*`

## License

Apache 2.0 (same as upstream). See LICENSE.
