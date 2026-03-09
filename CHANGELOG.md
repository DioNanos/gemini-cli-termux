# Changelog

All notable changes to Gemini CLI Termux Edition are documented here.

## [0.32.1-termux] - 2026-03-09

### Based on

- Upstream `v0.32.1`

### Added

- Termux postinstall PTY self-heal for `@mmmbuto/node-pty-android-arm64` when
  missing
- Security audit command (`npm run audit:prod`) for release gating

### Changed

- PTY dependency model now centers on `@mmmbuto/pty-termux-utils` (native PTY
  not declared at root)
- Security dependency refresh for `tar`, `rollup`, `minimatch`, `hono`,
  `@hono/node-server`, `express-rate-limit`
- `@modelcontextprotocol/sdk` bumped to `^1.27.1` in core/cli/vscode companion
- `scripts/check-termux-patches.sh` aligned to current merge state (no stale
  esbuild marker check)

### Fixed

- Merge-audit consistency issues in README and patch checker
- False-negative Termux patch validation after upstream v0.32.1 merge

## [0.30.5-termux] - 2026-02-25

### Based on

- Upstream `v0.30.0-nightly.20260224.544df749a`

### Added

- `tts_notification` Termux tool (`termux-tts-speak`)
- Termux detection utility export (`termux-detect`)
- Termux helper scripts (`scripts/termux-tools/*`, `scripts/termux-setup.sh`)
- Patch integrity checker (`scripts/check-termux-patches.sh`)
- `bundle/package.json` generation for update checks

### Changed

- Fork package naming/versioning (`@mmmbuto/gemini-cli-termux`, `*-termux`)
- Android/Termux build path in `scripts/build.js`
- `prepare`/`postinstall` flow for Termux installs
- Browser URL opening uses `termux-open-url` on Android/Termux
- Auto-update commands now use the installed package name dynamically
- `bundle`/publish workflow rebuilt for Termux packaging (`prepublishOnly`)

### Fixed

- PTY loading on Termux using `@mmmbuto/pty-termux-utils`
- Browser launch/auth flow on Termux
- Stale bundle metadata in packaged artifacts (`bundle/package.json`)

## [0.30.4-termux] - Test

### Notes

- Internal test tag/package used during merge validation.

## [0.30.3-termux] - 2026-02-24

### Fixed

- Added `termux-open-url` support in secure browser launcher

## [0.30.2-termux] - 2026-02-24

### Fixed

- Use `termux-open-url` for browser opening on Android

## [0.30.1-termux] - 2026-02-24

### Fixed

- `react-devtools-core` runtime resolution on Termux (empty-module alias)

## [0.30.0-termux] - 2026-02-24

### Added

- Upstream v0.30.0 merge with Termux patchset refresh
