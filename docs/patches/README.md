# Termux Patches (0.21.1-termux)

Minimal changes to run `gemini-cli` on Android/Termux ARM64 without native deps.

## Patch List
1) **Clipboard (TERMUX__PREFIX)** – On Termux set `TERMUX__PREFIX` from `$PREFIX` so clipboardy detects Termux correctly.
2) **Optional native modules** – Leave `node-pty`, `keytar`, `tree-sitter-bash` in `optionalDependencies`; build failures are tolerated. CLI must keep working (PTY features limited, keychain falls back to config storage).
3) **Core exports** – `packages/core/src/index.ts` re-exports stdio utilities and hook/telemetry APIs (`createInkStdio`, `createWorkingStdio`, session hooks, telemetry flush) so CLI bundling succeeds on Termux.
4) **Bundle** – Prebuilt `bundle/gemini.js` shipped in npm package (ARM64/Android) with policy files under `bundle/policies/`.

## Expected Warnings
- Missing native modules may log warnings on Termux; functionality remains (non-PTY shell, plain token storage).

## Scope
No functional changes to upstream features; only compatibility/export fixes.

**Version**: 0.21.1-termux
