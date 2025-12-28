# Test Report v0.24.0-termux

**Date**: 2025-12-28  
**Device**: ASUS ROG Phone 3 (Termux)  
**Node**: v24.11.1  
**Termux**: 0.118.3

| Section                          | Status | Notes                                                                         |
| -------------------------------- | ------ | ----------------------------------------------------------------------------- |
| 1. Version & Env                 | ✅     | 0.24.0-termux, aarch64, PREFIX OK                                             |
| 2. CLI Basics                    | ✅⚠️   | Help + model flag OK; auth/logout not shown in top-level help                 |
| 3. Hooks                         | ⏭️     | Skipped (feature not available)                                               |
| 4. Extensions                    | ✅⚠️   | `extensions list` OK; `extensions settings` requires a subcommand/extension   |
| 5. MCP                           | ✅⚠️   | `mcp list/add --help` OK; `gemini mcp` shows usage but exits 1                |
| 6. Non-interactive               | ✅⚠️   | JSON OK; GEMINI_JSONL produced single JSON object; MCP confirmations blocked  |
| 7. File ops (Termux safe)        | ✅⚠️   | `read file.txt` OK with one tool error logged; `ls` OK                        |
| 8. Termux specifics              | ✅     | `termux-info` OK, `termux-open-url` OK, LD_LIBRARY_PATH preserved             |
| 9. Package/binary                | ✅     | Global bundle present; repo bundle version OK; size ~22MB                     |
| 10. Known limits                 | ✅     | `node-pty` missing gracefully (MODULE_NOT_FOUND)                              |
| 11. Termux-API integration       | ✅⚠️   | `isTermux` true (dist/src path); discovery + call OK; install helpers skipped |
| 12. Context Memory & Memory Mode | ⏭️     | Manual/interactive validation pending (UI + /settings)                        |
| 13. Gemini 3 Flash               | ✅⚠️   | Static verification (model present in configs); live model test not run       |
| 14. Agent TOML Parser            | ✅     | `dist/src/agents/toml-loader.js` present                                      |
| 15. Auth Logout                  | ⏭️     | Manual/interactive                                                            |
| 16. Upstream Integration         | ⏭️     | Manual/interactive                                                            |
| 17. Termux Patches Integrity     | ✅     | TERMUX\_\_PREFIX + TTS guard verified; mobile settings present                |
| 18. Performance & Stability      | ⏭️     | Not executed                                                                  |

**Overall**: ✅ PASS (Partial execution; interactive steps pending)

**Critical issues**: None.

**Minor issues / notes**:

- **Non-interactive confirmations**: MCP memory tools require confirmation and
  are blocked in non-interactive runs.
- **Extensions settings**: `gemini extensions settings` needs a subcommand or
  extension name; adjust test step accordingly.
- **MCP help**: `gemini mcp` shows usage but exits 1 (expected CLI behavior).
- **JSONL output**: `GEMINI_JSONL=1` returned a single JSON object (not JSONL).
- **File read**: One `read_file` tool call logged a file-path error before
  succeeding.
- **Termux detect path**: `packages/core/dist/src/utils/termux-detect.js` is the
  correct compiled path (not `dist/utils`).
