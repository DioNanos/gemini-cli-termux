# Gemini CLI Termux Edition

Termux-only fork of Google Gemini CLI for Android devices.

This fork keeps upstream updates and applies a small Termux patch set focused on runtime stability.

## Scope

- Termux / Android only
- Release versions use the `-termux` suffix (no nightly naming in fork releases)
- Upstream base for this branch: `v0.30.0-nightly.20260224.544df749a`

## Termux Features Kept

- ARM64 PTY support via `@mmmbuto/pty-termux-utils` + `@mmmbuto/node-pty-android-arm64`
- `termux-open-url` integration for auth/browser flows
- TTS tool: `tts_notification` (uses `termux-tts-speak`)
- Termux-safe build/bundle scripts (`prepare-termux`, Android build path)
- Bundle update-check metadata (`bundle/package.json`)
- Termux helper scripts (`scripts/termux-tools/*`, `scripts/termux-setup.sh`)

## Install (Termux)

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts termux-api
npm install -g @mmmbuto/gemini-cli-termux@latest

gemini --version
```

## Quick Checks (Termux)

```bash
which termux-open-url
which termux-tts-speak
node -e "console.log(process.platform, process.env.PREFIX)"
gemini --version
```

## TTS Tool

The `tts_notification` tool is available in the fork and uses `termux-tts-speak`.

Enable notifications in `/settings` (`General -> Enable Notifications`) to allow TTS alerts.

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

## Patch Verification

Run the local patch integrity check after merges:

```bash
bash scripts/check-termux-patches.sh
```

## Documentation

- [CHANGELOG.md](./CHANGELOG.md)
- [test-reports/README.md](./test-reports/README.md)
- `docs/TERMUX.md`

## Upstream

- Upstream project: <https://github.com/google-gemini/gemini-cli>
- This fork: <https://github.com/DioNanos/gemini-cli-termux>
