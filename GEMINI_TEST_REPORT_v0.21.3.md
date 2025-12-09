# 🧪 Gemini CLI Termux Test Report (v0.21.3)

**Date**: 2025-12-09 **Version Tested**: 0.21.3-termux **Environment**: Android
(Termux) / aarch64 / Node v24.9.0

## Summary

| Section             | Status  | Notes                                                             |
| :------------------ | :------ | :---------------------------------------------------------------- |
| 1. Version & Env    | ✅ PASS | Correct version and architecture detected.                        |
| 2. CLI Basics       | ✅ PASS | `--help` passed.                                                  |
| 3. Hooks            | ⏭️ SKIP | Feature not available in this build.                              |
| 4. Extensions       | ✅ PASS | `list` passed. `settings` (with help) passed.                     |
| 5. MCP              | ✅ PASS | `list` and `add --help` passed.                                   |
| 6. Non-interactive  | ✅ PASS | Used `-o json` and `GEMINI_JSONL=1`. Response received via agent. |
| 7. File ops         | ✅ PASS | Successfully read/listed files via agent (JSON output).           |
| 8. Termux specifics | ✅ PASS | `termux-info`, `termux-open-url`, env vars preserved.             |
| 9. Package/binary   | ✅ PASS | Bundle works from global and local path.                          |
| 10. Known limits    | ✅ PASS | `node-pty` missing (handled gracefully).                          |

## Detailed Results

### 1. Version & Env

- `gemini --version`: `0.21.3-termux`
- Node: `v24.9.0`
- Arch: `aarch64`
- Prefix: `/data/data/com.termux/files/usr`

### 2. CLI Basics

- `gemini --help`: **Pass**.

### 3. Hooks

- Skipped as per test suite update.

### 4. Extensions

- `gemini extensions list`: **Pass**. Output: `No extensions installed.`
- `gemini extensions settings --help`: **Pass**. Prints usage information.

### 5. MCP

- `gemini mcp list`: **Pass**. Output: `No MCP servers configured.`
- `gemini mcp add --help`: **Pass**.

### 6. Non-interactive

- `gemini -o json "echo hello"`: **Pass**. Returns JSON response from agent.
- `GEMINI_JSONL=1 gemini -o json "pwd"`: **Pass**. Returns JSON lines.

### 7. File ops

- `echo hi > file.txt`: Setup successful.
- `gemini -o json "read file.txt"`: **Pass**. Agent successfully read the file
  ("hi").
- `gemini -o json "list files"`: **Pass**. Agent successfully listed files.

### 8. Termux specifics

- `termux-info`: **Pass**.
- `which termux-open-url`: **Pass**
  (`/data/data/com.termux/files/usr/bin/termux-open-url`).
- `LD_LIBRARY_PATH`: **Pass** (Preserved).

### 9. Package/binary

- Global path check: **Pass**.
- Local bundle execution (`node bundle/gemini.js`): **Pass**.

### 10. Known limits

- `node-pty`: **Pass**. Correctly detected as missing (graceful degradation).

## Conclusion

The `v0.21.3-termux` build is stable and functional on Termux (aarch64). The
test suite has been updated to reflect the current feature set (no `hooks`) and
correct command flags (`-o json`). All core features including file operations,
MCP, and extensions are working as expected within the known limitations.
