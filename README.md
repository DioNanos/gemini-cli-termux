# Gemini CLI - Termux Edition

Android/Termux-focused fork of Google Gemini CLI (`google-gemini/gemini-cli`).

- Tracks upstream updates
- Keeps a minimal Termux patch set (PTY, auth/browser, TTS, packaging fixes)
- Fork releases use the `-termux` suffix (no nightly naming in fork releases)
- Current test release: `v0.30.5-termux` (npm dist-tag `test`)
- Current stable npm dist-tag `latest`: `0.28.2-termux`

[![npm](https://img.shields.io/npm/v/@mmmbuto/gemini-cli-termux?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![downloads](https://img.shields.io/npm/dt/@mmmbuto/gemini-cli-termux?style=flat-square)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](./LICENSE)
[![ko-fi](https://img.shields.io/badge/Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi)](https://ko-fi.com/dionanos)

## What Is This?

This repository provides a Termux-first build of Gemini CLI for Android.

- Upstream project: <https://github.com/google-gemini/gemini-cli>
- Upstream docs: <https://geminicli.com/docs/>
- This fork: <https://github.com/DioNanos/gemini-cli-termux>

If you are not on Android/Termux, use the upstream package:

```bash
npm install -g @google/gemini-cli
```

## Why A Termux Fork?

Gemini CLI targets desktop platforms. On Termux/Android, a few dependencies and
environment assumptions can break install/runtime behavior.

This fork keeps the upstream experience intact while applying a small,
Termux-specific patch set:

- ARM64 PTY support via `@mmmbuto/pty-termux-utils` +
  `@mmmbuto/node-pty-android-arm64`
- `termux-open-url` integration for auth/browser flows
- TTS tool support via `tts_notification` (`termux-tts-speak`)
- Termux-safe build/bundle scripts and packaging/version consistency fixes
- Termux helper scripts (`scripts/termux-tools/*`, `scripts/termux-setup.sh`)

Base for `0.30.5-termux`: `v0.30.0-nightly.20260224.544df749a` (upstream)

## Installation (Termux)

### Prerequisites

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts
```

Optional but recommended:

```bash
pkg install -y termux-api
```

### Stable channel (`latest`)

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
gemini --version
```

### Test channel (`test`)

Use this to validate the current prerelease (`0.30.5-termux`) before promotion to
`latest`:

```bash
npm install -g @mmmbuto/gemini-cli-termux@test
gemini --version
```

### Update

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
```

## Quick Start

Interactive mode:

```bash
cd /path/to/your/project
gemini
```

Useful slash commands:

```text
/help
/auth
```

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

Android note: browser launch is handled via `termux-open-url`.

Headless/API key example:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## Termux Features

- PTY-backed interactive shell support on Android ARM64
- Auth/browser flow uses `termux-open-url`
- TTS tool `tts_notification` uses `termux-tts-speak`
- `bundle/package.json` generated for update/version checks
- Patch integrity checker: `scripts/check-termux-patches.sh`

### TTS Tool

The `tts_notification` tool is available in the fork and uses
`termux-tts-speak`.

Enable notifications in `/settings` (`General -> Enable Notifications`) to allow
TTS alerts.

## Testing And Reports (Termux-Only)

Test suites:

- [Full executable suite](./test-reports/suites/GEMINI-TEST-SUITE.md)
- [Basic smoke suite](./test-reports/suites/basic-smoke.md)

Latest executable validation report:

- [0.30.5-termux test report](./test-reports/0.30.5-termux/TEST-REPORT-2026-02-25.md)

Reports index:

- [test-reports/README.md](./test-reports/README.md)

## Build From Source (Termux)

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

### Patch Verification

Run after upstream merges / patch refresh:

```bash
bash scripts/check-termux-patches.sh
```

## Documentation

- [CHANGELOG.md](./CHANGELOG.md)
- [test-reports/README.md](./test-reports/README.md)
- `docs/TERMUX.md`

## Disclaimer

This is an independent community fork focused on making Gemini CLI reliable on
Android/Termux.

Gemini CLI is an upstream project by Google, licensed under Apache-2.0.

## Support

If this project helps your mobile workflow, support:

- Ko-fi: <https://ko-fi.com/dionanos>
