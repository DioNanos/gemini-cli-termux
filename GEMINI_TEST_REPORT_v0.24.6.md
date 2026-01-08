# Test Report v0.24.6-termux

**Date**: 2026-01-08 **Node**: v24.12.0 **Termux**: 0.118.3 **Arch**: aarch64

## Release Summary

- **PTY on Termux**: Uses `@mmmbuto/node-pty-android-arm64` prebuild (no
  node-gyp).
- **Prepare script**: Termux installs skip husky/bundle.
- **Build fix**: MCP SDK shim relaxed to avoid strict typing failures.

## Test Results

| Section                  | Status | Notes                                                             |
| ------------------------ | ------ | ----------------------------------------------------------------- |
| 1. Version & Env         | ✅     | 0.24.6-termux, Node v24.12.0, aarch64, Termux paths               |
| 2. CLI Basics            | ⚠️     | `--model` present; `auth/logout` not listed in `--help`           |
| 3. Hooks                 | ⏭️     | Skipped (not available in this build)                             |
| 4. Extensions            | ✅     | Extensions list/settings help OK                                  |
| 5. MCP                   | ✅     | MCP list connected to memory server                               |
| 6. Non-interactive       | ✅     | JSON output OK; memory_read denied by policy but non-blocking     |
| 7. File ops              | ✅     | Read/ls OK (one initial read_file miss due to file_txt path)      |
| 8. Termux specifics      | ✅     | termux-info OK, termux-open-url OK, LD_LIBRARY_PATH preserved     |
| 9. Package/binary        | ✅     | Global bundle present; repo bundle version OK; size ~22MB         |
| 10. PTY checks           | ✅     | @mmmbuto module loads; `require('node-pty')` fails as expected    |
| 11. Termux-API           | ✅     | Discovery/call OK; `make termux-install` + `termux-setup.sh` pass |
| 12. Context Memory       | ⏭️     | Skipped (interactive)                                             |
| 13. Gemini 3 Flash       | ⏭️     | Not tested                                                        |
| 14. Agent TOML           | ⚠️     | `packages/core/dist/agents/toml-loader.js` not found              |
| 15. Auth Logout          | ⏭️     | Skipped (interactive)                                             |
| 16. Upstream Integration | ⏭️     | Skipped (interactive)                                             |
| 17. Patches Integrity    | ⚠️     | TERMUX\_\_PREFIX + TTS guard OK; mobile UI checks skipped         |
| 18. Performance          | ⚠️     | Bundle size ~22MB; startup time not measured                      |

**Overall**: ⚠️ PARTIAL PASS (non-interactive flows OK; interactive checks
pending)

## Additional Notes

- `gemini` non-interactive runs attempted MCP memory reads that were denied by
  policy but did not block execution.
- `make termux-install` and `scripts/termux-setup.sh` both completed
  successfully.

---

**Release date**: 2026-01-08
