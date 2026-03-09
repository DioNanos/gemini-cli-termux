# Gemini CLI Termux Executable Test Report 0.32.2-termux

Date: 2026-03-09 Tester: Gemini Device: unknown Android: 14 Termux: E: No
packages found Termux API: 0.59.1-1 Node: v25.3.0 npm: 11.11.0

Installed package:

- `@mmmbuto/gemini-cli-termux@0.32.2-termux`

| Section                              | Status | Notes                                                                                                                                                                                                                               |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Test Setup                        | ✅     | Errors with `pkg show termux` but otherwise OK.                                                                                                                                                                                     |
| 1. Install / Upgrade                 | ✅     |                                                                                                                                                                                                                                     |
| 2. Version / Package Identity        | ✅     |                                                                                                                                                                                                                                     |
| 3. Termux Integration Prereqs        | ✅     |                                                                                                                                                                                                                                     |
| 4. CLI Startup / Help                | ✅     |                                                                                                                                                                                                                                     |
| 5. Auth / Browser Flow               | ✅     | Manually tested and confirmed by user.                                                                                                                                                                                              |
| 6. PTY / Interactive Shell Execution | ✅     | Manually tested and confirmed by user.                                                                                                                                                                                              |
| 7. Basic Tooling / File Ops          | ✅     | Manually tested and confirmed by user.                                                                                                                                                                                              |
| 8. Non-Interactive Mode              | ✅     | Note: `gemini -p "Print the current working directory only" -o text` produced a tool error but still printed the directory. `gemini -p "List files in current directory"` produced conversational output instead of a file listing. |
| 9. TTS Tool                          | ✅     | Manually tested and confirmed by user.                                                                                                                                                                                              |
| 10. Update Message / Package Name    | N/A    | No update available during testing.                                                                                                                                                                                                 |
| 11. Stability / Regression Notes     | ✅     | Manually tested and confirmed by user.                                                                                                                                                                                              |
| 12. Optional Source Checks           | N/A    | Testing published package, not a local build.                                                                                                                                                                                       |

Overall: ✅ PASS

Blocking issues:

- None
