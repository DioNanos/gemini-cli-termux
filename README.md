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
  optional.
- Bundled for ARM64/Android.
- Sunset: once upstream adds Termux support, migrate back to
  `@google/gemini-cli`.

## Installation (Termux)

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts -y
npm install -g @mmmbuto/gemini-cli-termux

gemini --version  # expected: 0.21.0-termux (latest)
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

## Updating

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
```

### Versions

- **latest**: 0.21.0-termux (this build)
- **previous/stable**: 0.20.3-termux (current npm dist-tag until publish)

## Tests

- Suite: [`GEMINI_TEST_SUITE.md`](./GEMINI_TEST_SUITE.md)
- Latest report:
  [`GEMINI_TEST_REPORT_v0.21.0.md`](./GEMINI_TEST_REPORT_v0.21.0.md)
  - 33/37 pass (89%); gaps: `gemini models list`, `gemini hooks` (x2),
    `gemini auth status` not implemented.
  - Package/Binary: 6/6 pass; Termux-specific: 8/8 pass; PTY optional module
    missing but non-blocking.

## Changelog (Termux)

- **0.21.0-termux** (latest): upstream 0.21.0 sync; Termux patches retained;
  bundle export fix for `createInkStdio`; test report v0.21.0.
- **0.20.3-termux** (stable): previous release, kept as fallback dist-tag.

## Upstream Tracking

- Upstream: https://github.com/google-gemini/gemini-cli
- Divergent files: `esbuild.config.js`, `docs/TERMUX.md`, `package.json`,
  `README.md`, `test-gemini/*`

## License

Apache 2.0 (same as upstream). See LICENSE.
