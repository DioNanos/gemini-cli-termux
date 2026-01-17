# 🤖 Gemini CLI – Termux Edition

Android/Termux optimized fork of **Google Gemini CLI** (`google-gemini/gemini-cli`).

- ✅ Tracks upstream regularly
- ✅ Minimal, Termux-focused patches
- ✅ Tested release: **v0.26.0-termux** (tag: `cf4a6ac20`)

[![npm](https://img.shields.io/npm/v/@mmmbuto/gemini-cli-termux?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![downloads](https://img.shields.io/npm/dt/@mmmbuto/gemini-cli-termux?style=flat-square)](https://www.npmjs.com/package/@mmmbuto/gemini-cli-termux)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](./LICENSE)
[![ko-fi](https://img.shields.io/badge/%E2%98%95%20Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi)](https://ko-fi.com/dionanos)

---

## What is this?

This repository packages a **Termux-first build** of Gemini CLI:

- **Upstream project**: https://github.com/google-gemini/gemini-cli
- **Upstream docs**: https://geminicli.com/docs/
- **This fork**: https://github.com/DioNanos/gemini-cli-termux

If you are on **macOS / Linux / Windows**, you should install the upstream package:

```bash
npm install -g @google/gemini-cli
```

---

## Why a Termux fork?

Gemini CLI is designed for desktop platforms. On Termux/Android, a few dependencies and environment assumptions can break or degrade UX.

This fork keeps the upstream experience intact while adding the **smallest possible patch-set** to make it reliable on Android:

- Native **ARM64 PTY** support (no node-gyp build on device)
- Termux-friendly clipboard detection
- Mobile filesystem + environment guardrails

---

## Installation (Termux)

### Prerequisites

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts
```

Optional but recommended for a better mobile experience:

```bash
pkg install -y termux-api
```

### Install

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest

gemini --version
```

### Update

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
```

### Upstream release channels

Upstream publishes `latest`, `preview`, and `nightly` builds. This fork is meant to track upstream **stable** while keeping Termux fixes.

---

## Quick start

Interactive mode:

```bash
cd /path/to/your/project

gemini
```

Useful slash commands inside the session:

```text
/help
/auth
```

Headless / CI usage:

```bash
gemini -p "Explain the project structure" \
  -o json
```

---

## Authentication

Gemini CLI supports multiple authentication methods (Google login, Gemini API key, Vertex AI). Termux users can use the same options as upstream.

### Interactive (recommended)

Start `gemini`, then run:

```bash
/auth
```

Follow the on-screen flow.

> Note (Android): Google login uses a browser flow that redirects to a `localhost` URL the CLI listens on during setup. Use the browser on the same device.

### Environment variables (headless / CI)

**Gemini API key (Google AI Studio):**

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**Vertex AI (examples):**

```bash
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_LOCATION="us-central1"

# Option A: API key
export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"

# Option B: Service account
# export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/keyfile.json"
```

**Persisting without leaking secrets:** create a `.gemini/.env` file (project-level) or `~/.gemini/.env` (user-level).

Full docs:

- https://google-gemini.github.io/gemini-cli/docs/get-started/authentication.html

---

## Termux optimizations (patches)

This fork applies a minimal set of Termux-specific fixes:

- **Clipboard detection fixes** for Android/Termux environments.
- **ARM64 PTY prebuild** for responsive interactive UI on Android.
- **Termux-API tool discovery** (when `termux-api` is installed).
- **Mobile-safe guards** (avoids desktop-only assumptions for paths, keychains, etc.).

All patches are documented under:

- `docs/patches/`

---

## Known differences vs upstream (v0.26.0-termux)

From the latest Termux test report:

- `gemini extensions settings` was renamed to `gemini extensions config`
- `auth` / `logout` are functional but may not appear in the top-level help output
- A standalone PTY require-test may fail in some environments even when PTY works in the app

Full report:

- [GEMINI_TEST_REPORT_v0.26.0.md](./GEMINI_TEST_REPORT_v0.26.0.md)

---

## Documentation

- **Test Suite**: [GEMINI_TEST_SUITE.md](./GEMINI_TEST_SUITE.md)
- **Test Report (latest)**: [GEMINI_TEST_REPORT_v0.26.0.md](./GEMINI_TEST_REPORT_v0.26.0.md)
- **Context Memory**: `docs/cli/context-memory.md`
- **Patches & Fixes**: `docs/patches/`

---

## Build from source (Termux)

```bash
git clone https://github.com/DioNanos/gemini-cli-termux.git
cd gemini-cli-termux
npm install
npm run build && npm run bundle
node bundle/gemini.js --version
```

---

## Disclaimer

This is an **independent community fork** created to improve the Termux experience.

Gemini CLI is an upstream project by Google, licensed under Apache-2.0.

---

## Support

If this project saved you time (or helped you run real work from your phone), you can support it here:

- ☕ Ko-fi: https://ko-fi.com/dionanos
