<div align="center">

[![npm version](https://img.shields.io/npm/v/@mmmbuto/gemini-cli-termux.svg)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@mmmbuto/gemini-cli-termux.svg)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)

**A Termux-first build of Gemini CLI for Android.**

</div>

> News (2026-05-01): `0.42.0-nightly.20260428.g59b2dea0e-termux` is the current
> Termux release on npm `latest`.

Gemini CLI Termux is a clean fork of
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli), rebuilt
release-by-release from upstream and patched only where Android/Termux needs
different behavior.

## Why a Termux fork?

Upstream targets desktop Unix and macOS first. On Android/Termux, the main
breakpoints are:

- PTY availability on ARM64
- install-time scripts that are fine on desktop but noisy on Termux
- browser auth flows that need `termux-open-url`

This fork keeps upstream behavior as close as possible while adding:

- Android ARM64 PTY support via `@mmmbuto/pty-termux-utils`
- `termux-open-url` integration for auth/browser flows
- optional `tts_notification` tool backed by `termux-tts-speak`
- Termux environment detection for runtime-specific behavior
- release docs and test suites intended to be run directly inside Termux

## Installation

### Termux / Android

```bash
pkg install nodejs-lts
pkg install termux-api   # optional, only for TTS

npm install -g @mmmbuto/gemini-cli-termux@latest
gemini --version
```

Requirements:

- [Termux from F-Droid](https://f-droid.org/packages/com.termux/)
- Node.js 20+
- `termux-api` only if you want TTS notifications

### Next channel

Use this to validate the current candidate before promotion to `latest`:

```bash
npm install -g @mmmbuto/gemini-cli-termux@next
gemini --version
```

### Non-Termux platforms

Use upstream:

```bash
npm install -g @google/gemini-cli
```

## Quick Start

```bash
cd your-project
gemini
```

Useful slash commands:

- `/help`
- `/auth`
- `/model`

Headless usage:

```bash
gemini -p "Explain the project structure" -o json
```

## Authentication

Termux supports the same authentication methods as upstream (Google login,
Gemini API key, Vertex AI).

Interactive (recommended):

```text
/auth
```

Browser launch is handled via `termux-open-url` on Android.

Headless/API key:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## Termux-specific features

### PTY support

The fork loads upstream PTY first, then falls back to
`@mmmbuto/pty-termux-utils` for Android ARM64.

### TTS notifications

If `termux-api` is installed, the fork exposes a `tts_notification` tool that
can speak short alerts:

```bash
termux-tts-speak "Gemini CLI Termux ready"
```

### Patch verification

After upstream merges or patch refreshes:

```bash
bash scripts/check-termux-patches.sh
```

### Release testing from Termux

Run the documented Termux release checks from:

- [test-reports/README.md](test-reports/README.md)
- [test-reports/suites/GEMINI-TEST-SUITE.md](test-reports/suites/GEMINI-TEST-SUITE.md)
- [test-reports/suites/basic-smoke.md](test-reports/suites/basic-smoke.md)

## Building from source

```bash
git clone https://github.com/DioNanos/gemini-cli-termux.git
cd gemini-cli-termux
npm install
npm run build
npm run bundle
node bundle/gemini.js --version
```

Alternative helper:

```bash
bash scripts/termux-setup.sh
```

## Troubleshooting

- If you are not on Termux, install upstream instead of this fork.
- If shell execution is broken on Android, verify the PTY dependency is present.
- If TTS does nothing, install `termux-api` and check `termux-tts-speak`.
- For release validation, use the Termux suite in
  [test-reports/README.md](test-reports/README.md).

## Acknowledgments

This fork is based on [Gemini CLI](https://github.com/google-gemini/gemini-cli)
and exists to keep a release-quality Termux track with minimal divergence from
upstream.

## License

Apache-2.0.
