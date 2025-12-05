# Gemini CLI Termux v0.21.0-termux

**Release Date**: 2025-12-05 **Base Version**: google-gemini/gemini-cli v0.21.0
**Status**: Ready for publish (tests pass with known warnings)

## Highlights

- Upstream 0.21.0 sync (Gemini CLI weekly updates through Dec 4).
- Termux compatibility retained: clipboard patch (TERMUX\_\_PREFIX), optional
  native modules (keytar/node-pty/tree-sitter-bash) flagged as optional, bundle
  built for ARM64/Android.
- Version bump to `0.21.0-termux` in package.json/package-lock.

## Test Results

- Test suite: `GEMINI_TEST_SUITE.md`
- Report: `GEMINI_TEST_REPORT_v0.21.0.md`
- Summary: 33/37 PASS (89%), 0 skipped, 4 FAIL (command coverage gaps)
  - Missing/unsupported commands: `gemini models list`, `gemini hooks` (2
    cases), `gemini auth status` → routed to LLM help instead of CLI handlers.
  - Node-pty optional module missing on Termux: falls back gracefully;
    interactive PTY features limited.
- Termux-specific checks: 8/8 PASS.
- Package/binary checks: 6/6 PASS; bin wrappers and symlink intact.

## Known Issues / Warnings

- **Commands not implemented**: models list, hooks (list/install), auth status.
  Decide whether to expose/implement or adjust test suite expectations.
- **PTY support**: `node-pty` not built on Termux; interactive shell features
  limited but CLI works.
- **Registry tags**: latest/stable still at 0.20.3-termux until publish; update
  dist-tags after release.

## Action Items Before Publish

1. Decide on CLI behavior for `models list`, `hooks`, `auth status` (implement
   or document as unsupported); adjust test suite accordingly.
2. Publish npm (`npm publish --tag latest`) and set dist-tags: `latest` →
   0.21.0-termux, `stable` → 0.20.3-termux (or chosen).
3. Create GitHub tag/release `v0.21.0-termux` with these notes.
4. Optional: attempt Termux build of `node-pty` to suppress warning
   (non-blocking).

## Files Updated

- `package.json`, `package-lock.json`: version → 0.21.0-termux
- `README.md`, `docs/TERMUX.md`: expected version updated; latest=0.21.0-termux
- `GEMINI_TEST_REPORT_v0.21.0.md`: results & warnings

## Version Summary

- **Latest** (planned): 0.21.0-termux
- **Previous**: 0.20.3-termux (current npm dist-tags)
