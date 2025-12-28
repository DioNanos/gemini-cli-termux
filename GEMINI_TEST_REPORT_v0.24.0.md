# Test Report v0.24.0-termux

**Date**: 2025-12-28  
**Device**: Android (Termux)  
**Node**: v24.11.1  
**Termux**: 0.118.3

| Section                          | Status | Notes                                                                                                                        |
| -------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1. Version & Env                 | ✅     | 0.24.0-termux, aarch64, PREFIX OK                                                                                            |
| 2. CLI Basics                    | ✅     | Help + model flag OK; auth/logout not shown in top-level help                                                                |
| 3. Hooks                         | ⏭️     | Skipped (feature not available)                                                                                              |
| 4. Extensions                    | ✅     | `extensions list/settings` OK                                                                                                |
| 5. MCP                           | ✅     | `mcp list/add/help` OK (memory MCP connected)                                                                                |
| 6. Non-interactive               | ✅⚠️   | JSON/JSONL output OK; non-interactive tool confirmations blocked; `run_shell_command` parser error (`Uint8Array.fromBase64`) |
| 7. File ops (Termux safe)        | ✅⚠️   | `read file.txt` + `ls` OK; same shell parser warning surfaced                                                                |
| 8. Termux specifics              | ✅     | `termux-info` OK, `termux-open-url` OK, LD_LIBRARY_PATH preserved                                                            |
| 9. Package/binary                | ✅     | Global bundle present; repo bundle version OK; size ~22MB                                                                    |
| 10. Known limits                 | ✅     | `node-pty` missing gracefully (MODULE_NOT_FOUND)                                                                             |
| 11. Termux-API integration       | ✅⚠️   | `isTermux` true; discovery + call OK; install helpers not executed                                                           |
| 12. Context Memory & Memory Mode | ⏭️     | Manual/interactive validation pending (UI + /settings)                                                                       |
| 13. Gemini 3 Flash               | ✅⚠️   | Static verification (model present in configs); live model test not run                                                      |
| 14. Agent TOML Parser            | ✅     | `dist/src/agents/toml-loader.js` present                                                                                     |
| 15. Auth Logout                  | ⏭️     | Manual/interactive                                                                                                           |
| 16. Upstream Integration         | ⏭️     | Manual/interactive                                                                                                           |
| 17. Termux Patches Integrity     | ✅     | TERMUX\_\_PREFIX + TTS guard verified; mobile settings present                                                               |
| 18. Performance & Stability      | ⏭️     | Not executed                                                                                                                 |

**Overall**: ✅ PASS (Partial execution; interactive steps pending)

**Critical issues**: None.

**Minor issues / notes**:

- **Non-interactive confirmations**: MCP memory tools require confirmation and
  are blocked in non-interactive runs.
- **Shell tool parser**: `run_shell_command` fails with
  `Uint8Array.fromBase64 is not a function` during non-interactive prompts. Core
  responses still returned, but shell tool execution is unavailable in this
  mode.
