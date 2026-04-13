# Basic Smoke Test Suite

Quick validation for Termux installation.

## Run

```bash
gemini --version
# Expected: <current-version>-termux (e.g. 0.37.1-termux)

gemini --help | head -10
# Expected: Usage information

gemini -p "Reply with OK"
# Expected: OK
```

## Success Criteria

- All 3 commands above succeed (exit code 0)
- No PTY errors in output
- No "command not found" errors
- Version string ends with `-termux` suffix
