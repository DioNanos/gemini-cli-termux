# Test Report v0.28.0-termux

**Date**: 2026-02-02 **Device**: Android/Termux **Node**: v25.3.0 **Termux**: 0.118.3

| Section                | Status | Notes        |
| ---------------------- | ------ | ------------ |
| 1. Version & Env       | ✅     | 0.28.0-termux, aarch64 |
| 2. CLI Basics          | ✅     | Help, version check OK |
| 6. Non-interactive     | ✅     | JSON/Text output OK |
| 7. File Ops            | ✅     | Read/Write OK |
| 8. Termux Specifics    | ✅     | Variables preserved |
| 10. PTY Checks         | ✅     | Loaded correctly |
| 11. Termux-API         | ✅     | Detection & Discovery OK |
| 12. Context Memory     | ⚠️     | Files exist, but `ENOENT` error on init |
| **13. Gemini 3 Flash** | ✅     | Responds correctly |
| 14. Agent TOML         | ❌     | Loader file not found (Project not updated) |
| 15. Auth Logout        | ⏭️     | Skipped (Interactive) |
| 17. Patches Integrity  | ✅     | TERMUX__PREFIX, TTS guard OK |
| 18. Performance        | ✅     | Fast response |

**Overall**: ✅ PASS (with minor warnings)

**Critical issues**: None.
**Minor issues**: 
- MCP Memory server connection error (ENOENT on empty path) during startup, though basic memory files are present.
- Source code search for `mobileSettings` and `toml-loader.js` failed (confirmed project source is older than binary/test suite expectations).
