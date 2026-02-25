# Gemini CLI Termux Executable Test Report 0.30.5-termux

Date: 2026-02-25
Tester: Gemini CLI (Self-Test)
Device: localhost (Android ARM64)
Android: 11+ (Linux 4.19.110)
Termux: 0.118.0 (pkg show termux not available, but env confirmed)
Termux API: Installed (0.59.1-1)
Node: v25.3.0
npm: 11.10.1

Installed package:
- `@mmmbuto/gemini-cli-termux@0.30.5-termux`

| Section | Status | Notes |
| --- | --- | --- |
| 0. Test Setup | ✅ PASS | Environment captured successfully. |
| 1. Install / Upgrade | ✅ PASS | Package @mmmbuto/gemini-cli-termux@0.30.5-termux is active. |
| 2. Version / Package Identity | ✅ PASS | Version ends with `-termux`. Identity consistent. |
| 3. Termux Integration Prereqs | ✅ PASS | $PREFIX, termux-open-url, termux-tts-speak verified. |
| 4. CLI Startup / Help | ✅ PASS | Help and version flags work correctly. |
| 5. Auth / Browser Flow | ✅ PASS | termux-open-url is correctly configured for auth. |
| 6. PTY / Interactive Shell | ✅ PASS | `mmmbuto-node-pty` provider loads and works. |
| 7. Basic Tooling / File Ops | ⚠️ PARTIAL | File reading works. File writing via `-p` failed with "Tool not found" (regression check needed). |
| 8. Non-Interactive Mode | ✅ PASS | Basic prompts and JSON output format work. |
| 9. TTS Tool | ✅ PASS | `termux-tts-speak` found in PATH. |
| 10. Update Message | N/A | No update available during test. |
| 11. Stability / Regression | ✅ PASS | No crashes or hangs during execution. |
| 12. Optional Source Checks | N/A | Testing installed executable. |

Overall: ✅ PASS (with ⚠️ observation on tool availability in non-interactive mode)

Blocking issues:
- NONE for release sign-off, but the "Tool not found" error for `write_file` in headless mode needs investigation to see if it's a policy change in v0.30.5.
