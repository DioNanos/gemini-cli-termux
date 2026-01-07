# Test Report v0.24.4-termux

**Date**: 2026-01-07 **Node**: v25.2.1 **Termux**: latest **Arch**: aarch64

## Release Summary

- **Packaging fix**: published bundle root again (restores working npm installs)
- **Auto-update**: update command resolved via package name

## Test Results

| Section                  | Status | Notes                                                           |
| ------------------------ | ------ | --------------------------------------------------------------- |
| 1. Version & Env         | ✅     | 0.24.4-termux, aarch64, Termux paths                            |
| 2. CLI Basics            | ⚠️     | `--model` present; `auth/logout` not listed in `--help`         |
| 4. Extensions            | ✅     | Extensions list/settings help OK                                |
| 5. MCP                   | ✅     | MCP list works (memory server connected)                        |
| 6. Non-interactive       | ✅     | JSON output works (memory_read denied by policy, non-blocking)  |
| 7. File ops              | ✅     | Read/ls works and returns content                               |
| 8. Termux specifics      | ⚠️     | termux-info/termux-open-url OK; LD_LIBRARY_PATH empty/undefined |
| 9. Package/binary        | ✅     | Global bundle present, size ~22MB, bundle version OK            |
| 10. Known limits         | ✅     | node-pty missing (expected)                                     |
| 11. Termux-API           | ⚠️     | discovery/call OK; setup/build failed (see Build Issues)        |
| 12. Context Memory       | ⏭️     | Skipped (interactive)                                           |
| 13. Gemini 3 Flash       | ⚠️     | Model runs OK; `--help` does not list flash                     |
| 14. Agent TOML           | ⏭️     | Skipped (core dist not built due to TS errors)                  |
| 15. Auth Logout          | ⏭️     | Skipped (interactive)                                           |
| 16. Upstream Integration | ⏭️     | Skipped (interactive)                                           |
| 17. Patches Integrity    | ⚠️     | TERMUX\_\_PREFIX + TTS guard OK; UI checks skipped              |
| 18. Performance          | ⚠️     | Startup 3.87s; memory usage not measured                        |

**Overall**: ⚠️ PARTIAL PASS (build/test gaps noted)

## Build Issues

- `npm run build --workspace @google/gemini-cli-core` fails with TypeScript
  errors for `@modelcontextprotocol/sdk` types (missing d.ts + implicit any).
- `scripts/termux-setup.sh` fails because it calls `npm run build`.

## Additional Notes

- MCP memory reads were denied by policy during non-interactive runs but did not
  block execution.
- `gemini --model gemini-3-flash-preview` works and returns correct answers.

## Performance Metrics

- **Bundle size**: ~22MB
- **Startup time**: 3.87s (`time gemini --version`)

## Conclusion

**v0.24.4-termux** fixes npm packaging and restores working installs. Runtime
CLI checks pass, but workspace build currently fails due to TypeScript type
issues in MCP SDK imports, so some dist-dependent checks are deferred.

---

**Release date**: 2026-01-07
