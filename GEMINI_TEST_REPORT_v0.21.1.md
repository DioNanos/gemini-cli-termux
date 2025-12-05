# 🧪 Gemini CLI Termux - Test Report v0.21.1-termux

**Version Tested**: 0.21.1-termux
**Platform**: Android Termux (aarch64)
**Date**: 2025-12-05

## Summary
- Total tests: 37
- ✅ Passed: 33
- ❌ Failed: 4
- ⚠️ Skipped: 0
- Success rate: 89%

## Category Breakdown
- System Info: 3/3
- Package/Binary: 6/6
- Interactive: 2/3 (missing commands)
- Non-Interactive: 2/2
- MCP Integration: 3/3
- Extensions: 3/3
- Hooks System: 0/2 (commands not implemented)
- File Ops: 3/3
- Network/Auth: 1/2 (auth status command missing)
- Documentation: 2/2
- Termux-Specific: 8/8

## Failures / Known Gaps
- `gemini models list` not implemented → falls back to LLM/help.
- `gemini hooks` (list/install) not implemented → triggers LLM/help.
- `gemini auth status` not implemented → triggers LLM/help.
- `node-pty` optional module missing; CLI logs warning but continues (PTY features limited).

## Notes
- Package/binary structure OK: bundle/gemini.js present; version matches 0.21.1-termux.
- Termux checks: PREFIX/LD_LIBRARY_PATH preserved; termux-open-url present.
- Web/Network basic check OK (curl available).

## Verdict
⚠️ PASS WITH WARNINGS — CLI usable on Termux; missing commands and PTY warnings are known/acceptable for this build.
