# Termux Patches (Upstream Differences)

This document lists **all patches** that differentiate this Termux fork from
upstream `google-gemini/gemini-cli`. It is not tied to a specific release; keep
it updated whenever a new patch is added or removed.

## Patch List

1. **Clipboard (TERMUX\_\_PREFIX)** – On Termux set `TERMUX__PREFIX` from
   `$PREFIX` so clipboardy detects Termux correctly.
2. **Android PTY prebuild** – Use `@mmmbuto/node-pty-android-arm64` for Termux;
   remove `@lydell/node-pty-*` and generic `node-pty`.
3. **Prepare script** – `prepare` is a no-op on Termux to avoid unnecessary
   bundle/husky work during installs.
4. **Core exports** – `packages/core/src/index.ts` re-exports stdio utilities,
   hook/telemetry APIs, Termux detectors, and context-memory helpers so CLI
   bundling succeeds on Termux.
5. **Bundle** – Prebuilt `bundle/gemini.js` shipped in npm package
   (ARM64/Android) with policy files under `bundle/policies/`.
6. **is-in-ci override** – Prevents ink from detecting Termux as CI.
7. **Punycode warning** – Suppresses deprecation warning on Android.
8. **Termux detection** – `packages/core/src/utils/termux-detect.ts` utility.
9. **Postinstall message** – Clear success message on Termux install.
10. **Context memory + Memory Mode** – JSON memories (base/user/journal) plus
    presets: `default`, `jit`, `jit+json`. Auto-load toggles, primary selector,
    and MCP import tool (disabled by default; base writes still gated).
11. **Mobile-first settings** – Compact `/settings` rendering by default on
    Termux; TTS toggle exposed (opt-in).
12. **Shell parser fix** – Base64 polyfill in bundle banner to support
    web-tree-sitter on Node 22/24 (fixes `run_shell_command`).
13. **MCP SDK typings shim** – Local `.d.ts` shims for
    `@modelcontextprotocol/sdk` to satisfy strict builds.
    [Details](./mcp-sdk-typings-shim.md)

## Expected Warnings

- No node-pty warnings expected on Termux. If PTY fails to load, the CLI falls
  back to `child_process`.

## Scope

No functional changes to upstream features; only compatibility/export fixes.

## Merge Strategy

All patches are designed to be merge-safe. See
[docs/termux-api/MERGE_STRATEGY.md](../termux-api/MERGE_STRATEGY.md) for details
on maintaining patches after upstream sync.

**Scope**: All active Termux releases (update as patches change).
