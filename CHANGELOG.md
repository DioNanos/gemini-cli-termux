# Changelog

All notable changes to Gemini CLI Termux Edition will be documented in this file.

## [0.30.0-termux] - WIP

### Added
- Merge upstream v0.30.0
- New Plan Mode tools (EnterPlanModeTool, ExitPlanModeTool)
- GetInternalDocs tool
- Improved settings dialog

### Changed
- Updated PTY package to @mmmbuto/pty-termux-utils v1.1.4
- Bundle now includes package.json for update checks

## [0.28.2-termux] - 2026-02-02

### Added
- Context Memory integration (`~/.gemini/context_memory/`)
- TTS Notification tool for Termux (`termux-tts-speak`)
- Mobile settings layout for narrow terminals

### Fixed
- PTY ARM64 support via prebuild binaries
- Clipboard detection for Termux environment
- Mobile filesystem guards

## [0.28.0-termux] - 2026-01-30

### Added
- Initial Termux fork from Google Gemini CLI v0.28.0
- PTY ARM64 prebuild (no node-gyp on device)
- Termux-friendly clipboard detection
- googleSearch tool fix for Android

---

## Upstream Tracking

This fork tracks [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli).

| Termux Version | Upstream Version |
|----------------|------------------|
| 0.30.0-termux  | 0.30.0           |
| 0.28.2-termux  | 0.28.2           |
| 0.28.0-termux  | 0.28.0           |

For full upstream changelog, see [upstream releases](https://github.com/google-gemini/gemini-cli/releases).

---

**Maintainer**: @DioNanos
**Repository**: https://github.com/DioNanos/gemini-cli-termux
