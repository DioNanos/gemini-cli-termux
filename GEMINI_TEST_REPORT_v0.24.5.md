# Test Report v0.24.5-termux

**Date**: 2026-01-07 **Node**: v25.2.1 **Termux**: latest **Arch**: aarch64

## Release Summary

- **Build fix**: MCP SDK typings shim for strict TypeScript builds on Termux
- **Auto-update**: update command uses `@mmmbuto/gemini-cli-termux`

## Test Results

| Section                  | Status | Notes                                                           |
| ------------------------ | ------ | --------------------------------------------------------------- |
| 1. Version & Env         | ✅     | 0.24.5-termux, aarch64, Termux paths                            |
| 2. CLI Basics            | ⚠️     | `--model` present; `auth/logout` not listed in `--help`         |
| 4. Extensions            | ✅     | Extensions list/settings help OK                                |
| 5. MCP                   | ✅     | MCP list works (memory server connected)                        |
| 6. Non-interactive       | ✅     | JSON output works (memory_read denied by policy, non-blocking)  |
| 7. File ops              | ✅     | Read/ls works and returns content                               |
| 8. Termux specifics      | ⚠️     | termux-info/termux-open-url OK; LD_LIBRARY_PATH empty/undefined |
| 9. Package/binary        | ✅     | Global bundle present, size ~22MB, bundle version OK            |
| 10. Known limits         | ✅     | node-pty missing (expected)                                     |
| 11. Termux-API           | ✅     | Detection/discovery/call OK; termux-install + setup OK          |
| 12. Context Memory       | ⏭️     | Skipped (interactive)                                           |
| 13. Gemini 3 Flash       | ⚠️     | Model runs OK; `--help` does not list flash                     |
| 14. Agent TOML           | ✅     | toml-loader present in dist/src/agents (14.2 optional not run)  |
| 15. Auth Logout          | ⏭️     | Skipped (interactive)                                           |
| 16. Upstream Integration | ⏭️     | Skipped (interactive)                                           |
| 17. Patches Integrity    | ⚠️     | TERMUX\_\_PREFIX + TTS guard OK; UI checks skipped              |
| 18. Performance          | ⚠️     | Startup 3.87s; memory usage not measured                        |

**Overall**: ⚠️ PARTIAL PASS (non-critical gaps noted)

## Build Issues (Resolved)

- Core/CLI TypeScript builds now pass with MCP SDK shims.
- `scripts/termux-setup.sh` and `make termux-install` complete successfully.

## Additional Notes

- MCP memory reads were denied by policy during non-interactive runs but did not
  block execution.
- `gemini --model gemini-3-flash-preview` works and returns correct answers.

## Performance Metrics

- **Bundle size**: ~22MB
- **Startup time**: 3.87s (`time gemini --version`)

## Conclusion

**v0.24.5-termux** hardens the Termux build by shimming missing MCP SDK typings.
Runtime CLI checks pass and workspace build succeeds; remaining warnings are
limited to non-critical CLI/help and optional interactive checks.

---

**Release date**: 2026-01-07
