# Test Report - Gemini CLI Termux
**Version:** 0.35.2-termux
**Model:** Default (not specified)
**Date:** 2026-03-27 12:14:12
**Executed by:** Gemini Agent

| Category | Test Case | Command Executed | Result | Notes |
|---|---|---|---|---|
| Core | Base Prompt | gemini -p '...' | PASS | The output confirmed the Termux environment and gave a greeting. (Output: Hello! I'm running on Termux and ready to assist you.) |
| Termux | PTY Execution | gemini -p 'run...' | PASS | The shell command output ('pty test') was captured successfully. |
| Tools | File Read/Write | gemini -p 'Write...' | FAIL | The CLI's internal agent does not have access to the `write_file` or `replace` tools for file manipulation. (The external environment has write permissions, as proven by a direct test). |
