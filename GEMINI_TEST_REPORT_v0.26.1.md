# Test Report v0.26.1-termux

**Date**: 2026-01-17
**Device**: Android (Termux)
**Node**: v24.13.0
**Termux**: aarch64

| Section                | Status | Notes        |
| ---------------------- | ------ | ------------ |
| 1. Version & Env       | ✅     | 0.26.1-termux, Node v24.13.0 |
| 2. CLI Basics          | ⚠️     | `auth` / `logout` commands functional but not listed in main help. |
| 4. Extensions          | ✅     | `gemini extensions settings` is now `gemini extensions config`. |
| 5. MCP                 | ✅     | Works as expected. |
| 6. Non-interactive     | ✅     | **CLEAN**: No `TypeError` on startup. JSON output is valid. |
| 7. File ops            | ✅     | File operations functional. |
| 8. Termux specifics    | ✅     | Paths and env vars preserved. |
| 9. Package/binary      | ✅     | Bundle present. |
| 10. PTY checks         | ⚠️     | Module present, functional in app context. |
| 11. Termux-API         | ✅     | Discovery and execution working. |
| 12. Context Memory     | ✅     | Memory listing works. |
| **13. Gemini 3 Flash** | ✅     | Responds correctly and fast ("10"). |
| 14. Agent TOML         | ✅     | Loader file present. |
| 15. Auth Logout        | ⚠️     | Functional but hidden. |
| 16. Integration        | ✅     | Startup error completely resolved. |
| 17. Patches Integrity  | ✅     | `TERMUX__PREFIX` confirmed. TTS guard confirmed active (blocked grep test). |
| 18. Performance        | ✅     | Fast startup. |

**Overall**: ✅ PASS

**Changes from v0.26.0**:
- Confirmed fix for startup `TypeError` is persistent in v0.26.1.
- Stability verified.

**Remaining Minor Issues**:
1.  `gemini extensions settings` command renamed to `config`.
2.  `auth` / `logout` and `flash` model options are not explicitly listed in the top-level help text.
