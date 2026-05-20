# Gemini CLI Termux

[![npm version](https://img.shields.io/npm/v/@mmmbuto/gemini-cli-termux.svg)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

Termux-first build of [Gemini CLI](https://github.com/google-gemini/gemini-cli)
for Android ARM64.

This fork tracks upstream release-by-release and keeps the fork delta limited to
Android/Termux compatibility, packaging, and validation assets.

Current fork release: `0.42.0-termux`.

## Install

```bash
pkg install nodejs-lts
pkg install termux-api   # optional, only for TTS notifications

npm install -g @mmmbuto/gemini-cli-termux@latest
gemini --version
```

Requirements:

- Termux from F-Droid
- Node.js 20+
- `termux-api` only if you want `termux-tts-speak` integration

For non-Termux platforms, use upstream:

```bash
npm install -g @google/gemini-cli
```

## Usage

```bash
cd your-project
gemini
```

Headless:

```bash
gemini -p "Explain this project" -o json
```

Useful slash commands:

- `/help`
- `/auth`
- `/model`

## Termux Delta

This fork adds or preserves:

- Android ARM64 PTY support through `@mmmbuto/pty-termux-utils`
- `termux-open-url` integration for auth/browser flows
- optional `tts_notification` support backed by `termux-tts-speak`
- Termux environment detection for runtime-specific behavior
- release validation docs under `test-reports/`

After upstream merges or release prep, verify the fork delta with:

```bash
bash scripts/check-termux-patches.sh
```

## Authentication

Termux supports the same user-facing auth paths as upstream Gemini CLI.

Interactive auth:

```text
/auth
```

API-key auth:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

When a browser URL must be opened on Android, the fork uses `termux-open-url`.

## Build

```bash
git clone https://github.com/DioNanos/gemini-cli-termux.git
cd gemini-cli-termux
npm install
npm run build
npm run bundle
node bundle/gemini.js --version
```

Optional Termux helper:

```bash
bash scripts/termux-setup.sh
```

## Release Validation

The public release checklist lives in:

- [test-reports/README.md](test-reports/README.md)
- [test-reports/suites/GEMINI-TEST-SUITE.md](test-reports/suites/GEMINI-TEST-SUITE.md)
- [test-reports/suites/basic-smoke.md](test-reports/suites/basic-smoke.md)

Minimum smoke:

```bash
gemini --version
gemini --help
gemini -p "Reply with OK"
```

## Maintenance Scope

In scope for this fork:

- Android/Termux runtime compatibility
- npm package `@mmmbuto/gemini-cli-termux`
- Termux validation reports and release assets
- minimal fork-owned GitHub CI/release automation

Out of scope:

- generic Gemini CLI feature requests
- upstream product behavior unrelated to Termux
- upstream Google infrastructure, bots, or release workflows

Generic issues should be filed upstream at
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli).
Termux-specific issues should be filed here.

## Security

See [SECURITY.md](SECURITY.md).

Termux-fork-specific security reports: `security@mmmbuto.com`.

Upstream-relevant security reports should follow the upstream Google security
process described in `SECURITY.md`.

## Maintainer

Maintained by [DioNanos](https://github.com/DioNanos) as the Termux/Android
porting and distribution fork.

See [MAINTAINER.md](MAINTAINER.md) and [NOTICE](NOTICE).

## License

Apache-2.0. This fork is distributed under the same license as upstream Gemini
CLI. The Android/Termux compatibility patches are distributed under Apache-2.0
as well.
