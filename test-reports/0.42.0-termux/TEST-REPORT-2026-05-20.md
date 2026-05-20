# Gemini CLI Termux 0.42.0-termux Test Report

Date: 2026-05-20 Package: `@mmmbuto/gemini-cli-termux@0.42.0-termux` Upstream
base: `@google/gemini-cli@0.42.0` Status: release candidate validation in
progress

## Scope

This report records the fork-side validation for promoting the upstream stable
`0.42.0` merge to the Termux package.

## Local build checks

- [ ] `npm ci`
- [ ] `bash scripts/check-termux-patches.sh`
- [ ] `npm run build`
- [ ] `npm run bundle`
- [ ] `node bundle/gemini.js --version`
- [ ] `npm pack --dry-run`

## Termux smoke checklist

- [ ] `npm install -g @mmmbuto/gemini-cli-termux@latest`
- [ ] `gemini --version` prints `0.42.0-termux`
- [ ] `gemini --help` exits 0
- [ ] `gemini -p "Reply with OK"` returns OK
- [ ] auth/browser flow opens through `termux-open-url`
- [ ] shell execution works without PTY errors
- [ ] optional TTS flow works when `termux-api` is installed

## Notes

- GitHub workflow surface is fork-owned only for this release: CI plus manual
  publish.
- Upstream Google bot/release workflows are intentionally not part of the public
  fork release branch.
